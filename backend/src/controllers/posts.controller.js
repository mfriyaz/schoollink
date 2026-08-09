const postsService = require("../services/posts.service");
const response = require("../utils/response");

async function getAllPosts(req, res) {

    try {

        const { search, type, page, limit } = req.query;

        const result = await postsService.getAllPosts(
            req.user.school_id,
            { search, type, page, limit }
        );

        return response.success(
            res,
            result,
            "Posts retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

module.exports = {

    getAllPosts

};
