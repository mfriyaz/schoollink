const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notification.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

router.get(
    "/me",
    authenticate,
    notificationController.getMyNotifications
);

router.get(
    "/me/expired",
    authenticate,
    notificationController.getExpiredNotifications
);

router.get(
    "/me/unread-count",
    authenticate,
    notificationController.getUnreadCount
);

router.patch(
    "/:id/read",
    authenticate,
    notificationController.markAsRead
);

router.patch(
    "/me/read-all",
    authenticate,
    notificationController.markAllAsRead
);

module.exports = router;
