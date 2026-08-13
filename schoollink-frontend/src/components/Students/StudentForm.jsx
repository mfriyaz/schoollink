import { useState, useEffect } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Button,
    Grid,
    TextField,
    MenuItem
} from "@mui/material";

import SchoolDatePicker from "../common/SchoolDatePicker";

import {
    createStudent,
    updateStudent
} from "../../services/studentService";

import {
    getMyClasses,
    getSectionsByClass
} from "../../services/postService";

const emptyStudent = {

    admission_no: "",
    first_name: "",
    last_name: "",
    gender: "Male",
    date_of_birth: "",
    father_name: "",
    mother_name: "",
    parent_phone: "",
    parent_email: "",
    address: "",
    class_id: "",
    section_id: "",
    is_active: true

};

function StudentForm({

    open,

    student: selectedStudent,

    onClose,

    onSaved

}) {

    const [student, setStudent] = useState(emptyStudent);

    const [classes, setClasses] = useState([]);

    const [sections, setSections] = useState([]);

    const [error, setError] = useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        if (open) {

            loadClasses();

        }

    }, [open]);

    useEffect(() => {

        if (selectedStudent) {

            setStudent({

                admission_no: selectedStudent.admission_no || "",
                first_name: selectedStudent.first_name || "",
                last_name: selectedStudent.last_name || "",
                gender: selectedStudent.gender || "Male",
                date_of_birth: selectedStudent.date_of_birth
                    ? selectedStudent.date_of_birth.substring(0, 10)
                    : "",
                father_name: selectedStudent.father_name || "",
                mother_name: selectedStudent.mother_name || "",
                parent_phone: selectedStudent.parent_phone || "",
                parent_email: selectedStudent.parent_email || "",
                address: selectedStudent.address || "",
                class_id: selectedStudent.class_id || "",
                section_id: selectedStudent.section_id || "",
                is_active: selectedStudent.is_active

            });

            if (selectedStudent.class_id) {

                loadSections(selectedStudent.class_id);

            }

        } else {

            setStudent(emptyStudent);

            setSections([]);

        }

        setError("");

    }, [selectedStudent, open]);

    async function loadClasses() {

        try {

            const response = await getMyClasses();

            if (response.success) {

                setClasses(response.data);

            }

        } catch (err) {

            console.error(err);

        }

    }

    async function loadSections(classId) {

        try {

            const response = await getSectionsByClass(classId);

            if (response.success) {

                setSections(response.data);

            }

        } catch (err) {

            console.error(err);

        }

    }

    function handleChange(event) {

        const { name, value } = event.target;

        setStudent((prev) => ({

            ...prev,

            [name]: value

        }));

    }

    function handleClassChange(event) {

        const classId = event.target.value;

        setStudent((prev) => ({

            ...prev,

            class_id: classId,

            section_id: ""

        }));

        setSections([]);

        if (classId) {

            loadSections(classId);

        }

    }

    async function handleSave() {

        setError("");

        if (!student.admission_no || !student.first_name || !student.last_name) {

            setError("Admission No, First Name and Last Name are required.");

            return;

        }

        if (!student.class_id || !student.section_id) {

            setError("Please select a Class and Section.");

            return;

        }

        // academic_year_id isn't picker-driven anywhere in the app
        // yet (Exams has the same simplification) - hardcoded to
        // the one seeded academic year until that's built.
        const payload = {

            academic_year_id: 1,

            class_id: student.class_id,

            section_id: student.section_id,

            admission_no: student.admission_no,
            first_name: student.first_name,
            last_name: student.last_name,
            gender: student.gender,
            date_of_birth: student.date_of_birth || null,
            father_name: student.father_name,
            mother_name: student.mother_name,
            parent_phone: student.parent_phone,
            parent_email: student.parent_email,
            address: student.address,

            is_active: student.is_active

        };

        try {

            setSaving(true);

            const response = selectedStudent

                ? await updateStudent(selectedStudent.id, payload)

                : await createStudent(payload);

            if (response.success) {

                setStudent(emptyStudent);

                if (onSaved) {

                    await onSaved();

                }

                onClose();

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save student."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >

            <DialogTitle>

                {selectedStudent ? "Edit Student" : "Add Student"}

            </DialogTitle>

            <DialogContent>

                {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}

                <Grid container spacing={2} sx={{ mt: 1 }}>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            label="Admission No"
                            name="admission_no"
                            value={student.admission_no}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            label="First Name"
                            name="first_name"
                            value={student.first_name}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            label="Last Name"
                            name="last_name"
                            value={student.last_name}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            select
                            label="Gender"
                            name="gender"
                            value={student.gender}
                            onChange={handleChange}
                        >

                            <MenuItem value="Male">Male</MenuItem>

                            <MenuItem value="Female">Female</MenuItem>

                        </TextField>

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            select
                            label="Class"
                            value={student.class_id}
                            onChange={handleClassChange}
                        >

                            {classes.map((c) => (

                                <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>

                            ))}

                        </TextField>

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            select
                            label="Section"
                            name="section_id"
                            value={student.section_id}
                            onChange={handleChange}
                            disabled={!student.class_id}
                        >

                            {sections.map((s) => (

                                <MenuItem key={s.id} value={s.id}>{s.section_name}</MenuItem>

                            ))}

                        </TextField>

                    </Grid>

                    <Grid size={6}>

                        <SchoolDatePicker
                            fullWidth
                            label="Date of Birth"
                            value={student.date_of_birth}
                            onChange={(val) => handleChange({ target: { name: "date_of_birth", value: val } })}
                        />

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            label="Father Name"
                            name="father_name"
                            value={student.father_name}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            label="Mother Name"
                            name="mother_name"
                            value={student.mother_name}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            label="Parent Phone"
                            name="parent_phone"
                            value={student.parent_phone}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={12}>

                        <TextField
                            fullWidth
                            label="Parent Email"
                            name="parent_email"
                            value={student.parent_email}
                            onChange={handleChange}
                        />

                    </Grid>

                    <Grid size={12}>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Address"
                            name="address"
                            value={student.address}
                            onChange={handleChange}
                        />

                    </Grid>

                </Grid>

            </DialogContent>

            <DialogActions>

                <Button onClick={onClose}>

                    Cancel

                </Button>

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                >

                    {saving ? "Saving..." : (selectedStudent ? "Update" : "Save")}

                </Button>

            </DialogActions>

        </Dialog>

    );

}

export default StudentForm;
