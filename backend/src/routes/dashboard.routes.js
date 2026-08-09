const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

router.get(

    "/",

    authenticate,

    authorizeRoles("School Admin"),

    dashboardController.getDashboard

);

module.exports = router;
