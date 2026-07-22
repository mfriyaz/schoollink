const reportCardService = require("../services/reportCard.service");
const pdfService = require("../services/pdf/reportCardPdf.service");

/**
 * Download Student Report Card PDF
 */
async function downloadReportCard(req, res) {

    try {

        const { studentId, examId } = req.params;

        const report =
            await reportCardService.getStudentReportCard(
                studentId,
                examId
            );

        if (!report || report.length === 0) {

            return res.status(404).json({
                success: false,
                message: "No report card found."
            });

        }

        let totalObtained = 0;
        let totalMaximum = 0;

        report.forEach(subject => {

            totalObtained += Number(subject.marks_obtained);
            totalMaximum += Number(subject.max_marks);

        });

        const reportData = {

            student: {

                student_id: report[0].student_id,
                admission_no: report[0].admission_no,
                name: `${report[0].first_name} ${report[0].last_name}`,
                class: report[0].class_name,
                section: report[0].section_name

            },

            exam: report[0].exam_name,

            summary: {

                total_marks: totalObtained,
                maximum_marks: totalMaximum,
                percentage: Number(
                    ((totalObtained / totalMaximum) * 100).toFixed(2)
                )

            },

            subjects: report

        };

        await pdfService.generateReportCard(
            reportData,
            res
        );

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

module.exports = {
    downloadReportCard
};