import { useState } from "react";

import { Box } from "@mui/material";

import StudentToolbar from "../../components/students/StudentToolbar";
import StudentStatistics from "../../components/students/StudentStatistics";
import StudentTable from "../../components/students/StudentTable";
import EmptyStudents from "../../components/students/EmptyStudents";

import useStudents from "../../hooks/useStudents";

export default function StudentListPage() {

    const {
        students,
        loading
    } = useStudents();

    const [search, setSearch] = useState("");

    const filteredStudents = students.filter(student =>
        `${student.first_name} ${student.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    function handleAdd() {

        console.log("Add Student");

    }

    function handleEdit(student) {

        console.log("Edit Student", student);

    }

    function handleDelete(student) {

        console.log("Delete Student", student);

    }

    if (loading) {

        return null;

    }

    return (

        <Box>

            <StudentToolbar
                search={search}
                setSearch={setSearch}
                onAdd={handleAdd}
            />

            <StudentStatistics
                students={filteredStudents}
            />

            {

                filteredStudents.length === 0 ? (

                    <EmptyStudents />

                ) : (

                    <StudentTable
                        students={filteredStudents}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                )

            }

        </Box>

    );

}