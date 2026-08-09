const dashboardRepository = require("../repositories/dashboard.repository");

async function getDashboardSummary(schoolId) {

    const students =
        await dashboardRepository.getStudentCount(schoolId);

    const teachers =
        await dashboardRepository.getTeacherCount(schoolId);

    const classes =
        await dashboardRepository.getClassCount(schoolId);

    const recentStudents =
        await dashboardRepository.getRecentStudents(schoolId);

    const birthdays =
        await dashboardRepository.getBirthdays(schoolId);

    const announcements =
        await dashboardRepository.getAnnouncements(schoolId);

    const postsToday =
        await dashboardRepository.getPostsTodayCount(schoolId);

    const recentPosts =
        await dashboardRepository.getRecentPosts(schoolId);

    const recentAnnouncements =
        await dashboardRepository.getRecentAnnouncements(schoolId);

    const mergedRecentPosts = [...recentPosts, ...recentAnnouncements]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    const pendingByClass =
        await dashboardRepository.getPendingAcknowledgementsByClass(schoolId);

    const pendingAcknowledgements = pendingByClass.reduce(
        (sum, row) => sum + row.pending_count,
        0
    );

    return {

        students,

        teachers,

        classes,

        attendance: 97,

        recentStudents,

        birthdays,

        announcements,

        postsToday,

        recentPosts: mergedRecentPosts,

        pendingAcknowledgements,

        pendingByClass

    };

}

module.exports = {

    getDashboardSummary

};
