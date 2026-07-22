const gradeModel = require("../models/grade.model");

/**
 * Calculate Grade
 */
async function calculateGrade(
    schoolId,
    marksObtained,
    maximumMarks
) {

    if (maximumMarks <= 0) {
        throw new Error("Maximum marks must be greater than zero.");
    }

    const percentage =
        (Number(marksObtained) / Number(maximumMarks)) * 100;

    const grade =
        await gradeModel.findGradeByPercentage(
            schoolId,
            percentage
        );

    if (!grade) {
        throw new Error(
            "No grade configuration found for this percentage."
        );
    }

    return {

        percentage: Number(percentage.toFixed(2)),

        grade_name: grade.grade_name,

        grade_point: Number(grade.grade_point),

        result: grade.result

    };

}

module.exports = {

    calculateGrade

};