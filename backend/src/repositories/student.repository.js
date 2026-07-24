import db from "../config/database.js";

export async function findAllStudents() {

    const sql = `

        SELECT

            id,

            admission_no,

            first_name,

            last_name,

            gender,

            is_active

        FROM students

        ORDER BY first_name;

    `;

    const result = await db.query(sql);

    return result.rows;

}

export async function findStudentById(id){

    const sql=`

        SELECT *

        FROM students

        WHERE id=$1

    `;

    const result=await db.query(sql,[id]);

    return result.rows[0];

}