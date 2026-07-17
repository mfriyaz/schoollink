const bcrypt = require("bcrypt");

const pool = require("../config/database");

const schoolModel = require("../models/school.model");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");

async function onboardSchool(data) {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        // Extract request data
        const { school, admin } = data;

        // Validate School Code
        const existingSchool =
            await schoolModel.findSchoolByCode(
                school.school_code,
                client
            );

        if (existingSchool) {
            throw new Error("School code already exists");
        }

        // Validate Email
        const existingEmail =
            await userModel.findUserByEmail(
                admin.email,
                client
            );

        if (existingEmail) {
            throw new Error("Administrator email already exists");
        }

        // Validate Mobile
        const existingMobile =
            await userModel.findUserByMobile(
                admin.mobile,
                client
            );

        if (existingMobile) {
            throw new Error("Administrator mobile already exists");
        }

        // Get School Admin Role
        const role =
            await roleModel.getRoleByName(
                "School Admin",
                client
            );

        if (!role) {
            throw new Error("School Admin role not found");
        }

        // ⭐ ADD THIS NEXT
        // Create School
const newSchool = await schoolModel.createSchool(
    school,
    client
);

// Hash Password
const passwordHash = await bcrypt.hash(
    admin.password,
    10
);

// Prepare User Data
const userData = {

    school_id: newSchool.id,

    role_id: role.id,

    full_name: admin.full_name,

    email: admin.email,

    mobile: admin.mobile,

    password_hash: passwordHash

};

// Create School Administrator
const newAdmin = await userModel.createUser(
    userData,
    client
);

// Commit Transaction
await client.query("COMMIT");

return {

    school: newSchool,

    administrator: newAdmin

};

// (Next step: create the admin user here)

await client.query("COMMIT");

return {

    school: newSchool,

    administrator: {

        id: newAdmin.id,

        full_name: newAdmin.full_name,

        email: newAdmin.email,

        mobile: newAdmin.mobile

    }

};

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

}

module.exports = {
    onboardSchool
};