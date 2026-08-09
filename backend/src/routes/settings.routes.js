const express = require("express");

const router = express.Router();

const settingsController = require("../controllers/settings.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

router.get(
    "/me",
    authenticate,
    settingsController.getSettings
);

router.patch(
    "/me",
    authenticate,
    settingsController.updateSettings
);

module.exports = router;
