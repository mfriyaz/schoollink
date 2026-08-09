const express = require("express");

const router = express.Router();

const uploadController = require("../controllers/upload.controller");

const upload = require("../middleware/upload.middleware");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Upload a Post Attachment
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    upload.single("attachment"),
    uploadController.uploadAttachment
);

module.exports = router;
