const notificationService = require("../services/notification.service");
const response = require("../utils/response");

async function getMyNotifications(req, res) {

    try {

        const notifications =
            await notificationService.getMyNotifications(req.user.id);

        return response.success(
            res,
            notifications,
            "Notifications retrieved successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

async function getExpiredNotifications(req, res) {

    try {

        const notifications =
            await notificationService.getExpiredNotifications(req.user.id);

        return response.success(
            res,
            notifications,
            "Expired notifications retrieved successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

async function getUnreadCount(req, res) {

    try {

        const count =
            await notificationService.getUnreadCount(req.user.id);

        return response.success(
            res,
            { count },
            "Unread count retrieved successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

async function markAsRead(req, res) {

    try {

        const notification = await notificationService.markAsRead(
            req.params.id,
            req.user.id
        );

        return response.success(
            res,
            notification,
            "Notification marked as read"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

async function markAllAsRead(req, res) {

    try {

        await notificationService.markAllAsRead(req.user.id);

        return response.success(
            res,
            null,
            "All notifications marked as read"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

module.exports = {

    getMyNotifications,

    getExpiredNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead

};
