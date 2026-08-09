const reportCardService = require("../services/reportCard.service");

/**
 * Get Student Report Card
 */
async function getStudentReportCard(req, res) {

    try {

        const { studentId, examId } = req.params;

        if (req.user.role === "Parent") {

            const owns = await reportCardService.parentOwnsStudent(
                req.user.id,
                studentId
            );

            if (!owns) {

                return res.status(403).json({
                    success: false,
                    message: "This student is not linked to your account"
                });

            }

        }

        const report =
            await reportCardService.getStudentReportCard(
                studentId,
                examId
            );

        if (report.length === 0) {

            return res.status(404).json({
                success: false,
                message: "No report card found."
            });

        }

        // School Admin/Teacher can only see report cards for
        // their own school - a student ID from another school
        // shouldn't be viewable just by guessing an ID.
        if (report[0].school_id !== req.user.school_id) {

            return res.status(403).json({
                success: false,
                message: "This student does not belong to your school"
            });

        }

        // Calculate Summary
        let totalObtained = 0;
        let totalMaximum = 0;

        report.forEach(subject => {

            totalObtained += Number(subject.marks_obtained);
            totalMaximum += Number(subject.max_marks);

        });

        const overallPercentage =
            Number(
                (
                    (totalObtained / totalMaximum) * 100
                ).toFixed(2)
            );

        return res.status(200).json({

            success: true,

            school_name: report[0].school_name,

            student: {

                student_id: report[0].student_id,
                admission_no: report[0].admission_no,
                name:
                    report[0].first_name +
                    " " +
                    report[0].last_name,
                class: report[0].class_name,
                section: report[0].section_name

            },

            exam: report[0].exam_name,

            summary: {

                total_marks: totalObtained,
                maximum_marks: totalMaximum,
                percentage: overallPercentage

            },

            subjects: report

        });

    } catch (error) {

        return res.status(500).json({

            success: false,
            message: error.message

        });

    }

}

module.exports = {

    getStudentReportCard

};
