const notificationModel = require("../models/notification.model");

async function getMyNotifications(userId) {

    return await notificationModel.getMyNotifications(userId);

}

async function getExpiredNotifications(userId) {

    return await notificationModel.getExpiredNotifications(userId);

}

async function getUnreadCount(userId) {

    return await notificationModel.getUnreadCount(userId);

}

async function markAsRead(id, userId) {

    return await notificationModel.markAsRead(id, userId);

}

async function markAllAsRead(userId) {

    return await notificationModel.markAllAsRead(userId);

}

module.exports = {

    getMyNotifications,

    getExpiredNotifications,

    getUnreadCount,

    markAsRead,

    markAllAsRead

};
