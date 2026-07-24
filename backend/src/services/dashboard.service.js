const dashboardRepository = require("../repositories/dashboard.repository");

async function getDashboardSummary() {

    const students =
        await dashboardRepository.getStudentCount();

    const teachers =
        await dashboardRepository.getTeacherCount();

    const classes =
        await dashboardRepository.getClassCount();

    const recentStudents =
        await dashboardRepository.getRecentStudents();

    const birthdays =
        await dashboardRepository.getBirthdays();

    const announcements =
        await dashboardRepository.getAnnouncements(1);

    return {

        students,

        teachers,

        classes,

        attendance: 97,

        recentStudents,

        birthdays,

        announcements

    };

}

module.exports = {

    getDashboardSummary

};