const pool = require("../config/database");
const { getCurrentYear } = require("./currentYear.service");

class RolloverError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const ACTIONS = ["promote", "stay", "leave"];

/**
 * Start a new academic year and move students in one step.
 * Everything is saved together, or nothing is.
 *
 * moves: [{ student_id, action: "promote" | "stay" | "leave", to_class_id, to_section_id }]
 * Active students that are not listed simply stay in their class.
 * Teacher assignments carry over to the new year unchanged.
 */
async function startNewYear(schoolId, userId, body) {

    const yearName = String(body.year_name || "").trim();
    const startDate = body.start_date;
    const endDate = body.end_date;
    const moves = Array.isArray(body.moves) ? body.moves : [];

    if (!yearName || yearName.length > 20) {
        throw new RolloverError("Enter a year name of up to 20 characters, for example 2027-2028.");
    }

    if (!startDate || !endDate) {
        throw new RolloverError("Start date and end date are required.");
    }

    if (endDate <= startDate) {
        throw new RolloverError("The end date must be after the start date.");
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const oldYear = await getCurrentYear(schoolId, client);

        const same = await client.query(
            "SELECT 1 FROM academic_years WHERE school_id = $1 AND LOWER(year_name) = LOWER($2) AND is_active = true",
            [schoolId, yearName]
        );

        if (same.rows.length > 0) {
            throw new RolloverError("A year with this name already exists.", 409);
        }

        const students = await client.query(
            "SELECT id, class_id, section_id FROM students WHERE school_id = $1 AND is_active = true FOR UPDATE",
            [schoolId]
        );

        const studentMap = new Map(students.rows.map((s) => [s.id, s]));

        const sections = await client.query(
            `
            SELECT sec.id, sec.class_id
            FROM sections sec
            JOIN classes c ON c.id = sec.class_id
            WHERE c.school_id = $1
              AND sec.is_active IS NOT FALSE
              AND c.is_active IS NOT FALSE
            `,
            [schoolId]
        );

        const sectionClass = new Map(sections.rows.map((s) => [s.id, s.class_id]));

        const moveMap = new Map();

        for (const m of moves) {

            const sid = Number(m.student_id);

            if (!studentMap.has(sid)) {
                throw new RolloverError("One of the students in the list was not found, or is already inactive.");
            }

            if (!ACTIONS.includes(m.action)) {
                throw new RolloverError("Each student must be promoted, kept in the same class, or marked as left.");
            }

            if (m.action === "promote") {

                const toClass = Number(m.to_class_id);
                const toSection = Number(m.to_section_id);

                if (!sectionClass.has(toSection) || sectionClass.get(toSection) !== toClass) {
                    throw new RolloverError("Pick a valid class and section for every promoted student.");
                }

            }

            moveMap.set(sid, m);

        }

        // Close the old year, open the new one
        await client.query(
            "UPDATE academic_years SET is_current = false WHERE school_id = $1",
            [schoolId]
        );

        const created = await client.query(
            `
            INSERT INTO academic_years (school_id, year_name, start_date, end_date, is_current)
            VALUES ($1, $2, $3, $4, true)
            RETURNING *
            `,
            [schoolId, yearName, startDate, endDate]
        );

        const newYear = created.rows[0];

        const summary = { promoted: 0, stayed: 0, left: 0 };

        for (const s of students.rows) {

            const m = moveMap.get(s.id) || { action: "stay" };

            if (m.action === "promote") {

                await client.query(
                    `UPDATE students
                        SET class_id = $1, section_id = $2, academic_year_id = $3, updated_at = NOW()
                      WHERE id = $4 AND school_id = $5`,
                    [Number(m.to_class_id), Number(m.to_section_id), newYear.id, s.id, schoolId]
                );

                summary.promoted += 1;

            } else if (m.action === "leave") {

                await client.query(
                    `UPDATE students SET is_active = false, updated_at = NOW()
                      WHERE id = $1 AND school_id = $2`,
                    [s.id, schoolId]
                );

                summary.left += 1;

            } else {

                await client.query(
                    `UPDATE students SET academic_year_id = $1, updated_at = NOW()
                      WHERE id = $2 AND school_id = $3`,
                    [newYear.id, s.id, schoolId]
                );

                summary.stayed += 1;

            }

            await client.query(
                `
                INSERT INTO student_promotions
                    (school_id, student_id, from_year_id, to_year_id,
                     from_class_id, from_section_id, to_class_id, to_section_id, action, created_by)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                `,
                [
                    schoolId, s.id, oldYear.id, newYear.id,
                    s.class_id, s.section_id,
                    m.action === "promote" ? Number(m.to_class_id) : s.class_id,
                    m.action === "promote" ? Number(m.to_section_id) : s.section_id,
                    m.action, userId || null
                ]
            );

        }

        // Current teacher assignments continue into the new year
        await client.query(
            `UPDATE teacher_subjects
                SET academic_year_id = $1, updated_at = CURRENT_TIMESTAMP
              WHERE school_id = $2 AND ended_at IS NULL`,
            [newYear.id, schoolId]
        );

        await client.query("COMMIT");

        return { year: newYear, previous_year: oldYear, ...summary };

    } catch (err) {

        try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }

        if (err.code === "23505") {
            throw new RolloverError("A year with this name already exists.", 409);
        }

        throw err;

    } finally {

        client.release();

    }

}

async function listYears(schoolId) {

    const result = await pool.query(
        `
        SELECT ay.id, ay.year_name, ay.start_date, ay.end_date, ay.is_current,
               (SELECT COUNT(*)::int FROM students s WHERE s.academic_year_id = ay.id AND s.is_active = true) AS students
        FROM academic_years ay
        WHERE ay.school_id = $1 AND ay.is_active = true
        ORDER BY ay.start_date DESC
        `,
        [schoolId]
    );

    return result.rows;

}

module.exports = { startNewYear, listYears, RolloverError };
