const express = require("express");

const router = express.Router();

const postsController = require("../controllers/posts.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Get All Posts (homework + announcements, searchable/filterable)
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    postsController.getAllPosts
);

module.exports = router;
