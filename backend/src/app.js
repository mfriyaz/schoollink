console.log("✅ APP LOADED");
const express = require("express");

const app = express();

app.use(express.json());

// Routes
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const schoolRoutes = require("./routes/school.routes");
const adminRoutes = require("./routes/admin.routes");
const platformRoutes = require("./routes/platform.routes");
const academicYearRoutes = require("./routes/academicYear.routes");
const classRoutes = require("./routes/class.routes");
const sectionRoutes = require("./routes/section.routes");
const studentRoutes = require("./routes/student.routes");
const teacherRoutes = require("./routes/teacher.routes");
const subjectRoutes = require("./routes/subject.routes");
const teacherSubjectRoutes = require("./routes/teacherSubject.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const homeworkRoutes = require("./routes/homework.routes");
const examRoutes = require("./routes/exam.routes");

// Register Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/teacher-subjects", teacherSubjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/exams", examRoutes);


// Home
app.get("/", (req, res) => {
    res.json({
        application: "SchoolLink",
        version: "1.0.0",
        status: "Running"
    });
});

module.exports = app;