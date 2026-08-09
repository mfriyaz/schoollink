const XLSX = require("xlsx");

const pool = require("../config/database");

const studentService = require("./student.service");

const { assertUnderLimit } = require("../utils/schoolLimits");

const TEMPLATE_HEADERS = [
    "admission_no",
    "first_name",
    "last_name",
    "gender",
    "date_of_birth",
    "father_name",
    "mother_name",
    "parent_phone",
    "parent_email",
    "address",
    "class_name",
    "section_name"
];

/**
 * Generate the downloadable Excel template - a header row, one
 * example row, and a second sheet listing this school's actual
 * class/section names so the admin knows exactly what to type.
 */
async function generateTemplate(schoolId) {

    const classResult = await pool.query(
        `
        SELECT c.class_name, sec.section_name
        FROM classes c
        JOIN sections sec ON sec.class_id = c.id
        WHERE c.school_id = $1
        AND c.is_active = true
        AND sec.is_active = true
        ORDER BY c.class_order, sec.section_name
        `,
        [schoolId]
    );

    const workbook = XLSX.utils.book_new();

    const exampleRow = [
        "GIS0099",
        "Jane",
        "Doe",
        "Female",
        "2016-04-12",
        "John Doe",
        "Mary Doe",
        "+65 8123 4567",
        "jane.parent@example.com",
        "123 Orchard Road",
        classResult.rows[0]?.class_name || "Grade 1",
        classResult.rows[0]?.section_name || "A"
    ];

    const studentsSheet = XLSX.utils.aoa_to_sheet([
        TEMPLATE_HEADERS,
        exampleRow
    ]);

    XLSX.utils.book_append_sheet(workbook, studentsSheet, "Students");

    const classRows = [
        ["class_name", "section_name"],
        ...classResult.rows.map((r) => [r.class_name, r.section_name])
    ];

    const classesSheet = XLSX.utils.aoa_to_sheet(classRows);

    XLSX.utils.book_append_sheet(workbook, classesSheet, "Valid Classes");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

}

/**
 * Parse an uploaded Excel buffer, validate each row, and create
 * students that pass validation. Rows that fail are reported
 * back with a reason rather than aborting the whole import.
 */
async function bulkImportStudents(schoolId, fileBuffer) {

    const workbook = XLSX.read(fileBuffer, {

        type: "buffer",

        cellDates: true

    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (rows.length === 0) {

        throw new Error("The uploaded file has no data rows.");

    }

    if (rows.length > 500) {

        throw new Error("Please upload 500 students or fewer at a time.");

    }

    const classResult = await pool.query(
        `
        SELECT c.id AS class_id, c.class_name, sec.id AS section_id, sec.section_name
        FROM classes c
        JOIN sections sec ON sec.class_id = c.id
        WHERE c.school_id = $1
        AND c.is_active = true
        AND sec.is_active = true
        `,
        [schoolId]
    );

    const classMap = new Map();

    for (const row of classResult.rows) {

        const key = `${row.class_name}`.trim().toLowerCase() +
            "|" + `${row.section_name}`.trim().toLowerCase();

        classMap.set(key, { class_id: row.class_id, section_id: row.section_id });

    }

    const created = [];

    const failed = [];

    for (let i = 0; i < rows.length; i++) {

        const row = rows[i];

        const rowNumber = i + 2; // +1 for header row, +1 for 1-indexing

        try {

            if (!row.admission_no || !row.first_name || !row.last_name) {

                throw new Error("Admission No, First Name and Last Name are required.");

            }

            if (!row.class_name || !row.section_name) {

                throw new Error("Class Name and Section Name are required.");

            }

            const classKey = `${row.class_name}`.trim().toLowerCase() +
                "|" + `${row.section_name}`.trim().toLowerCase();

            const matchedClass = classMap.get(classKey);

            if (!matchedClass) {

                throw new Error(
                    `No matching Class/Section found for "${row.class_name} / ${row.section_name}". Check the "Valid Classes" sheet.`
                );

            }

            let dateOfBirth = null;

            if (row.date_of_birth) {

                const parsed = row.date_of_birth instanceof Date
                    ? row.date_of_birth
                    : new Date(row.date_of_birth);

                if (!isNaN(parsed.getTime())) {

                    dateOfBirth = parsed.toISOString().slice(0, 10);

                }

            }

            await assertUnderLimit(schoolId, "students");

            const student = await studentService.createStudent({

                school_id: schoolId,

                academic_year_id: 1,

                class_id: matchedClass.class_id,

                section_id: matchedClass.section_id,

                admission_no: String(row.admission_no).trim(),

                first_name: String(row.first_name).trim(),

                last_name: String(row.last_name).trim(),

                gender: row.gender || null,

                date_of_birth: dateOfBirth,

                father_name: row.father_name || null,

                mother_name: row.mother_name || null,

                parent_phone: row.parent_phone ? String(row.parent_phone) : null,

                parent_email: row.parent_email || null,

                address: row.address || null

            });

            created.push({ row: rowNumber, admission_no: student.admission_no });

        } catch (err) {

            failed.push({

                row: rowNumber,

                admission_no: row.admission_no || "(missing)",

                reason: err.message

            });

        }

    }

    return {

        total_rows: rows.length,

        created_count: created.length,

        failed_count: failed.length,

        created,

        failed

    };

}

module.exports = {

    generateTemplate,

    bulkImportStudents

};
