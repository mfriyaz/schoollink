const bcrypt = require("bcrypt");

const userModel = require("../models/user.model");

async function createAdmin(data) {

    if (await userModel.emailExists(data.email)) {
        throw new Error("Email already exists");
    }

    if (await userModel.mobileExists(data.mobile)) {
        throw new Error("Mobile number already exists");
    }

    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );

    return await userModel.createUser({

        school_id: data.school_id,

        role_id: 2,

        full_name: data.full_name,

        email: data.email,

        mobile: data.mobile,

        password_hash: hashedPassword

    });

}

module.exports = {

    createAdmin

};