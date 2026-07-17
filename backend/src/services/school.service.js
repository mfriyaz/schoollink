const schoolModel = require("../models/school.model");

async function createSchool(data) {
    return await schoolModel.createSchool(data);
}

async function getAllSchools() {
    return await schoolModel.getAllSchools();
}

async function getSchoolById(id) {
    return await schoolModel.getSchoolById(id);
}

async function updateSchool(id, data) {
    return await schoolModel.updateSchool(id, data);
}

async function deleteSchool(id) {

    const school = await schoolModel.deleteSchool(id);

    if (!school) {
        throw new Error("School not found");
    }

    return school;
}

module.exports = {
    createSchool,
    getAllSchools,
    updateSchool,
    deleteSchool,
    getSchoolById
};