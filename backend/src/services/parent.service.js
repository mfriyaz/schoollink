const parentModel = require("../models/parent.model");

/**
 * Get My Children
 */
async function getMyChildren(parentUserId) {

    return await parentModel.getMyChildren(parentUserId);

}

module.exports = {

    getMyChildren

};
