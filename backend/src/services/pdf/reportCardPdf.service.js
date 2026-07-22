const PDFDocument = require("pdfkit");

/**
 * Generate Report Card PDF
 */
async function generateReportCard(reportData, res) {

    const doc = new PDFDocument({
        margin: 50,
        size: "A4"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        "inline; filename=report-card.pdf"
    );

    doc.pipe(res);

    // School Header
    doc
        .fontSize(22)
        .text("FOUSIYYA PRIMARY SCHOOL", {
            align: "center"
        });

    doc
        .fontSize(18)
        .text("Student Report Card", {
            align: "center"
        });

    doc.moveDown(2);

    // Student Details
    doc.fontSize(12);

    doc.text(`Student : ${reportData.student.name}`);
    doc.text(`Admission No : ${reportData.student.admission_no}`);
    doc.text(`Class : ${reportData.student.class}`);
    doc.text(`Section : ${reportData.student.section}`);
    doc.text(`Exam : ${reportData.exam}`);

    doc.moveDown();

    doc.text("------------------------------------------------------------");

    // Subject Table Header
    doc.moveDown();

    doc.text("Subject", 50, doc.y, { continued: true });
    doc.text("Marks", 250, doc.y, { continued: true });
    doc.text("Grade", 350, doc.y, { continued: true });
    doc.text("Result", 450);

    doc.moveDown();

    // Subject Rows
    reportData.subjects.forEach(subject => {

        doc.text(subject.subject_name, 50, doc.y, { continued: true });
        doc.text(subject.marks_obtained.toString(), 250, doc.y, { continued: true });
        doc.text(subject.grade_name, 350, doc.y, { continued: true });
        doc.text(subject.result, 450);

    });

    doc.moveDown();

    doc.text("------------------------------------------------------------");

    doc.moveDown();

    // Summary
    doc.text(`Total Marks : ${reportData.summary.total_marks}`);
    doc.text(`Maximum Marks : ${reportData.summary.maximum_marks}`);
    doc.text(`Percentage : ${reportData.summary.percentage}%`);

    doc.moveDown(3);

    doc.text("_______________________");
    doc.text("Class Teacher");

    doc.moveDown(2);

    doc.text("_______________________");
    doc.text("Principal");

    doc.end();

}

module.exports = {
    generateReportCard
};