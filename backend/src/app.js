console.log("✅ APP LOADED");

const express = require("express");
const cors = require("cors");

const app = express();

// ======================
// Middlewares
// ======================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());

// ======================
// Routes
// ======================

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
const examSubjectRoutes = require("./routes/examSubject.routes");
const studentMarkRoutes = require("./routes/studentMark.routes");
const gradeRoutes = require("./routes/grade.routes");
const reportCardRoutes = require("./routes/reportCard.routes");
const reportCardPdfRoutes = require("./routes/reportCardPdf.routes");
const teacherDashboardRoutes = require("./routes/teacherDashboard.routes");
const parentDashboardRoutes = require("./routes/parentDashboard.routes");
const principalDashboardRoutes = require("./routes/principalDashboard.routes");
const announcementRoutes = require("./routes/announcement.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const errorHandler = require("./middleware/error.middleware");

// ======================
// Register Routes
// ======================

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
app.use("/api/exam-subjects", examSubjectRoutes);
app.use("/api/student-marks", studentMarkRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/report-cards", reportCardRoutes);
app.use("/api/report-cards", reportCardPdfRoutes);
app.use("/api/teacher-dashboard", teacherDashboardRoutes);
app.use("/api/parent-dashboard", parentDashboardRoutes);
app.use("/api/principal-dashboard", principalDashboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/dashboard", dashboardRoutes);

// ======================
// Home
// ======================

app.get("/", (req, res) => {

    res.json({

        application: "SchoolLink",

        version: "1.0.0",

        status: "Running"

    });

});

// ======================
// Global Error Handler
// ======================

app.use(errorHandler);

module.exports = app;