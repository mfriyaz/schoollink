const ExcelJS = require("exceljs");

const pool = require("../config/database");
const { getCurrentYearId } = require("./currentYear.service");

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
 * Turn one Excel cell into a plain value (text, number or Date).
 * Handles formulas, rich text, links and empty cells.
 */
function plainCell(v) {

    if (v === null || v === undefined) return "";

    if (v instanceof Date) return v;

    if (typeof v === "object") {

        if (Array.isArray(v.richText)) return v.richText.map((t) => t.text).join("");

        if (v.result !== undefined) return plainCell(v.result);

        if (v.text !== undefined) return plainCell(v.text);

        if (v.error) return "";

        return "";

    }

    return v;

}

/**
 * Read the first sheet of an .xlsx file: row 1 holds the column names,
 * every later row becomes an object. Blank rows are skipped.
 */
async function readFirstSheet(fileBuffer) {

    const workbook = new ExcelJS.Workbook();

    try {

        await workbook.xlsx.load(fileBuffer);

    } catch (err) {

        throw new Error("That file could not be read. Please upload the .xlsx template.");

    }

    const sheet = workbook.worksheets[0];

    if (!sheet) return [];

    if (sheet.rowCount > 2000 || sheet.columnCount > 60) {

        throw new Error("That sheet is too large. Please upload 500 students or fewer at a time.");

    }

    const headers = [];

    sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {

        headers[col] = String(plainCell(cell.value)).trim();

    });

    const rows = [];

    for (let r = 2; r <= sheet.rowCount; r++) {

        const excelRow = sheet.getRow(r);

        const obj = { __row: r };

        let hasData = false;

        headers.forEach((name, col) => {

            if (!name) return;

            const value = plainCell(excelRow.getCell(col).value);

            if (value !== "") hasData = true;

            obj[name] = value;

        });

        if (hasData) {

            for (const name of headers) {

                if (name && obj[name] === undefined) obj[name] = "";

            }

            rows.push(obj);

        }

    }

    return rows;

}

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

    const workbook = new ExcelJS.Workbook();

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

    const studentsSheet = workbook.addWorksheet("Students");

    studentsSheet.addRow(TEMPLATE_HEADERS);

    studentsSheet.addRow(exampleRow);

    studentsSheet.columns.forEach((col) => { col.width = 18; });

    studentsSheet.getRow(1).font = { bold: true };

    const classRows = [
        ["class_name", "section_name"],
        ...classResult.rows.map((r) => [r.class_name, r.section_name])
    ];

    const classesSheet = workbook.addWorksheet("Valid Classes");

    classRows.forEach((r) => classesSheet.addRow(r));

    classesSheet.columns.forEach((col) => { col.width = 18; });

    classesSheet.getRow(1).font = { bold: true };

    return Buffer.from(await workbook.xlsx.writeBuffer());

}

/**
 * Parse an uploaded Excel buffer, validate each row, and create
 * students that pass validation. Rows that fail are reported
 * back with a reason rather than aborting the whole import.
 */
async function bulkImportStudents(schoolId, fileBuffer) {

    const currentYearId = await getCurrentYearId(schoolId);

    const rows = await readFirstSheet(fileBuffer);

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

        const rowNumber = row.__row || i + 2; // the row's real number in the sheet

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

                academic_year_id: currentYearId,

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
