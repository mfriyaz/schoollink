import { useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    MenuItem
} from "@mui/material";

import { createStudent } from "../../services/studentService";

function StudentForm({

    open,

    onClose,

    onSaved

}) {

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
        address: ""

    };

    const [student, setStudent] = useState(emptyStudent);

    function handleChange(event) {

        setStudent({

            ...student,

            [event.target.name]: event.target.value

        });

    }

    async function handleSave() {

        console.log("========== SAVE BUTTON CLICKED ==========");

        const payload = {

            school_id: 37,
            academic_year_id: 1,
            class_id: 6,
            section_id: 1,

            admission_no: student.admission_no,
            first_name: student.first_name,
            last_name: student.last_name,
            gender: student.gender,
            date_of_birth: student.date_of_birth,
            father_name: student.father_name,
            mother_name: student.mother_name,
            parent_phone: student.parent_phone,
            parent_email: student.parent_email,
            address: student.address

        };

        console.log("Payload:", payload);

        try {

            const response = await createStudent(payload);

            console.log("Create Response:", response);

            if (response.success) {

                alert("Student added successfully.");

                setStudent(emptyStudent);

                if (onSaved) {
                    await onSaved();
                }

                onClose();

            } else {

                alert(response.message);

            }

        } catch (err) {

            console.error("SAVE ERROR:", err);

            console.error("Response:", err.response);

            alert(
                err.response?.data?.message ||
                "Unable to save student."
            );

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
                Add Student
            </DialogTitle>

            <DialogContent>

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
                            type="date"
                            label="Date of Birth"
                            name="date_of_birth"
                            value={student.date_of_birth}
                            onChange={handleChange}
                            slotProps={{
                                inputLabel: {
                                    shrink: true
                                }
                            }}
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
                    onClick={() => {
                    console.log("SAVE BUTTON PRESSED");
                    handleSave();
                 }}
             >
                Save
                </Button>

            </DialogActions>

        </Dialog>

    );

}

export default StudentForm;