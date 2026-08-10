const bcrypt = require("bcrypt");

const teacherModel = require("../models/teacher.model");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const emailService = require("./email.service");

/**
 * Create Teacher
 *
 * Also creates a real login account (Teacher role) if
 * `temporary_password` is provided - a teacher record without
 * one would have no way to log in at all, which was a real
 * gap this closes. If no password is given, falls back to the
 * old behaviour (profile-only, no login) for backwards
 * compatibility.
 */
async function createTeacher(data) {

    let userId = null;

    if (data.temporary_password && data.email) {

        if (await userModel.emailExists(data.email)) {

            throw new Error("Email already exists");

        }

        const teacherRole = await roleModel.getRoleByName("Teacher");

        const hashedPassword = await bcrypt.hash(data.temporary_password, 10);

        const user = await userModel.createUser({

            school_id: data.school_id,

            role_id: teacherRole.id,

            full_name: `${data.first_name} ${data.last_name}`,

            email: data.email,

            mobile: data.phone,

            password_hash: hashedPassword

        });

        userId = user.id;

    }

    const teacher = await teacherModel.createTeacher({

        ...data,

        user_id: userId

    });

    if (userId) {

        try {

            await emailService.sendEmail(

                data.email,

                "Your SchoolLink Teacher Account",

                `An account has been created for you on SchoolLink.<br><br>` +
                `Email: ${data.email}<br>` +
                `Temporary Password: ${data.temporary_password}<br><br>` +
                `Please log in and change your password.`

            );

        } catch (err) {

            console.error("Failed to send teacher welcome email:", err);

        }

    }

    return teacher;

}

/**
 * Get Teachers By School
 */
async function getTeachersBySchool(schoolId) {

    return await teacherModel.getTeachersBySchool(schoolId);

}

/**
 * Get Teacher By ID
 */
async function getTeacherById(id, schoolId) {

    return await teacherModel.getTeacherById(id, schoolId);

}

/**
 * Get Teacher By User ID
 */
async function getTeacherByUserId(userId) {

    return await teacherModel.getTeacherByUserId(userId);

}

/**
 * Update Teacher
 */
async function updateTeacher(id, schoolId, data) {

    return await teacherModel.updateTeacher(id, schoolId, data);

}

/**
 * Deactivate Teacher
 */
async function deactivateTeacher(id, schoolId) {

    return await teacherModel.deactivateTeacher(id, schoolId);

}

/**
 * Reactivate Teacher
 */
async function reactivateTeacher(id, schoolId) {

    return await teacherModel.reactivateTeacher(id, schoolId);

}

module.exports = {

    createTeacher,

    getTeachersBySchool,

    getTeacherById,

    getTeacherByUserId,

    updateTeacher,

    deactivateTeacher,

    reactivateTeacher

};
