const postsRepository = require("../repositories/posts.repository");

async function getAllPosts(schoolId, { search, type, page, limit }) {

    const pageNum = Number(page) || 1;

    const pageSize = Number(limit) || 15;

    let homework = [];

    let announcements = [];

    if (!type || type === "homework") {

        homework = await postsRepository.getAllHomeworkPosts(schoolId, search);

    }

    if (!type || type === "announcement") {

        announcements = await postsRepository.getAllAnnouncementPosts(schoolId, search);

    }

    const merged = [...homework, ...announcements].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const start = (pageNum - 1) * pageSize;

    const pageItems = merged.slice(start, start + pageSize);

    return {

        posts: pageItems,

        total: merged.length,

        page: pageNum,

        totalPages: Math.ceil(merged.length / pageSize) || 1

    };

}

module.exports = {

    getAllPosts

};
