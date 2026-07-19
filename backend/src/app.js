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

// Home
app.get("/", (req, res) => {
    res.json({
        application: "SchoolLink",
        version: "1.0.0",
        status: "Running"
    });
});

module.exports = app;