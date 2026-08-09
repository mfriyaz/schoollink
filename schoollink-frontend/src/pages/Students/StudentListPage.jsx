import { useState } from "react";

import { Box, Alert } from "@mui/material";

import StudentToolbar from "../../components/Students/StudentToolbar";
import StudentStatistics from "../../components/Students/StudentStatistics";
import StudentTable from "../../components/Students/StudentTable";
import EmptyStudents from "../../components/Students/EmptyStudents";
import StudentForm from "../../components/Students/StudentForm";
import StudentViewDialog from "../../components/Students/StudentViewDialog";
import BulkImportResultDialog from "../../components/Students/BulkImportResultDialog";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import useStudents from "../../hooks/useStudents";

import {
    deleteStudent,
    reactivateStudent
} from "../../services/studentService";

import {
    downloadStudentTemplate,
    bulkUploadStudents
} from "../../services/studentBulkImportService";

export default function StudentListPage() {

    const {
        students,
        loading,
        reload
    } = useStudents();

    const [search, setSearch] = useState("");

    const [formOpen, setFormOpen] = useState(false);

    const [editingStudent, setEditingStudent] = useState(null);

    const [viewOpen, setViewOpen] = useState(false);

    const [viewingStudent, setViewingStudent] = useState(null);

    const [pageError, setPageError] = useState("");

    const [uploading, setUploading] = useState(false);

    const [importResult, setImportResult] = useState(null);

    const [importResultOpen, setImportResultOpen] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const [confirmTarget, setConfirmTarget] = useState(null);

    const filteredStudents = students.filter(student =>
        `${student.first_name} ${student.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    function handleAdd() {

        setEditingStudent(null);

        setFormOpen(true);

    }

    function handleView(student) {

        setViewingStudent(student);

        setViewOpen(true);

    }

    function handleEdit(student) {

        setEditingStudent(student);

        setFormOpen(true);

    }

    function handleDelete(student) {

        setPageError("");

        setConfirmTarget(student);

        setConfirmOpen(true);

    }

    async function handleConfirmToggle() {

        const student = confirmTarget;

        setConfirmOpen(false);

        if (!student) {

            return;

        }

        try {

            const response = student.is_active

                ? await deleteStudent(student.id)

                : await reactivateStudent(student.id);

            if (response.success) {

                await reload();

            } else {

                setPageError(response.message);

            }

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to update this student."
            );

        }

    }

    async function handleFormSaved() {

        await reload();

    }

    async function handleDownloadTemplate() {

        setPageError("");

        try {

            const blob = await downloadStudentTemplate();

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = "student_import_template.xlsx";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to download the template."
            );

        }

    }

    async function handleUploadFile(file) {

        setPageError("");

        try {

            setUploading(true);

            const response = await bulkUploadStudents(file);

            if (response.success) {

                setImportResult(response.data);

                setImportResultOpen(true);

                await reload();

            } else {

                setPageError(response.message);

            }

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to upload this file."
            );

        } finally {

            setUploading(false);

        }

    }

    if (loading) {

        return null;

    }

    return (

        <Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            <StudentToolbar
                search={search}
                setSearch={setSearch}
                onAdd={handleAdd}
                onDownloadTemplate={handleDownloadTemplate}
                onUploadFile={handleUploadFile}
                uploading={uploading}
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
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                )

            }

            <StudentForm
                open={formOpen}
                student={editingStudent}
                onClose={() => setFormOpen(false)}
                onSaved={handleFormSaved}
            />

            <StudentViewDialog
                open={viewOpen}
                student={viewingStudent}
                onClose={() => setViewOpen(false)}
            />

            <BulkImportResultDialog
                open={importResultOpen}
                result={importResult}
                onClose={() => setImportResultOpen(false)}
            />

            <ConfirmDialog
                open={confirmOpen}
                title={confirmTarget?.is_active ? "Deactivate Student" : "Reactivate Student"}
                message={

                    confirmTarget?.is_active

                        ? `Deactivate ${confirmTarget?.first_name} ${confirmTarget?.last_name}? Their records (attendance, marks, homework) are kept, and they can be reactivated later.`

                        : `Reactivate ${confirmTarget?.first_name} ${confirmTarget?.last_name}?`

                }
                confirmLabel={confirmTarget?.is_active ? "Deactivate" : "Reactivate"}
                confirmColor={confirmTarget?.is_active ? "error" : "success"}
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmOpen(false)}
            />

        </Box>

    );

}
