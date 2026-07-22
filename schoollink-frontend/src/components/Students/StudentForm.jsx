import { useState, useEffect } from "react";

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

import {
    createStudent,
    updateStudent
} from "../../services/studentService";

function StudentForm({

    open,

    student: selectedStudent,

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
    address: "",
    is_active: true

};

    const [student, setStudent] = useState(emptyStudent);

    useEffect(() => {

        if (selectedStudent) {

           setStudent({

    admission_no: selectedStudent.admission_no,
    first_name: selectedStudent.first_name,
    last_name: selectedStudent.last_name,
    gender: selectedStudent.gender,
    date_of_birth: selectedStudent.date_of_birth.substring(0,10),
    father_name: selectedStudent.father_name,
    mother_name: selectedStudent.mother_name,
    parent_phone: selectedStudent.parent_phone,
    parent_email: selectedStudent.parent_email,
    address: selectedStudent.address,
    is_active: selectedStudent.is_active

});

        } else {

            setStudent(emptyStudent);

        }

    }, [selectedStudent]);

    function handleChange(event) {

        const { name, value } = event.target;

        setStudent((prev) => ({

            ...prev,

            [name]: value

        }));

    }

    async function handleSave() {

        const payload = {

    school_id:37,
    academic_year_id:1,
    class_id:6,
    section_id:1,

    admission_no:student.admission_no,
    first_name:student.first_name,
    last_name:student.last_name,
    gender:student.gender,
    date_of_birth:student.date_of_birth,
    father_name:student.father_name,
    mother_name:student.mother_name,
    parent_phone:student.parent_phone,
    parent_email:student.parent_email,
    address:student.address,

    is_active: student.is_active

};

        console.log("Payload:", payload);

        try {

            let response;

            if (selectedStudent) {

                response = await updateStudent(

                    selectedStudent.id,

                    payload

                );

            } else {

                response = await createStudent(payload);

            }

            console.log(response);

            if (response.success) {

                alert(

                    selectedStudent

                        ? "Student updated successfully."

                        : "Student added successfully."

                );

                setStudent(emptyStudent);

                if (onSaved) {

                    await onSaved();

                }

                onClose();

            }

        } catch (err) {

            console.error(err);

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

                {

                    selectedStudent

                        ? "Edit Student"

                        : "Add Student"

                }

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

                            <MenuItem value="Male">

                                Male

                            </MenuItem>

                            <MenuItem value="Female">

                                Female

                            </MenuItem>

                        </TextField>

                    </Grid>

                    <Grid size={6}>

                        <TextField
                            fullWidth
                            type="date"
                            name="date_of_birth"
                            label="Date of Birth"
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
                    onClick={handleSave}
                >

                    {

                        selectedStudent

                            ? "Update"

                            : "Save"

                    }

                </Button>

            </DialogActions>

        </Dialog>

    );

}

export default StudentForm;