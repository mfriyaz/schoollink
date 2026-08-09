const settingsModel = require("../models/settings.model");

async function getSettings(userId) {

    return await settingsModel.getSettings(userId);

}

async function updateSettings(userId, data) {

    return await settingsModel.updateSettings(userId, data);

}

module.exports = {

    getSettings,

    updateSettings

};
