const bcrypt = require("bcrypt");

const parentModel = require("../models/parent.model");
const userModel = require("../models/user.model");
const roleModel = require("../models/role.model");
const emailService = require("./email.service");

/**
 * Get My Children
 */
async function getMyChildren(parentUserId) {

    return await parentModel.getMyChildren(parentUserId);

}

/**
 * Create a new Parent account (or reuse an existing one, for a
 * parent adding a second child) and link them to a student.
 *
 * If `existing_parent_email` is provided, that account is
 * reused - no new login is created, just a new link. Otherwise
 * `full_name`/`mobile`/`temporary_password` are used to create
 * a brand new Parent account.
 */
async function createOrLinkParent(data) {

    let parentUser;

    let isNewAccount = false;

    if (data.existing_parent_email) {

        parentUser = await parentModel.findParentByEmail(

            data.existing_parent_email,

            data.school_id

        );

        if (!parentUser) {

            throw new Error(

                "No existing parent account found with that email at this school."

            );

        }

    } else {

        if (await userModel.emailExists(data.email)) {

            throw new Error("Email already exists");

        }

        const parentRole = await roleModel.getRoleByName("Parent");

        const hashedPassword = await bcrypt.hash(data.temporary_password, 10);

        parentUser = await userModel.createUser({

            school_id: data.school_id,

            role_id: parentRole.id,

            full_name: data.full_name,

            email: data.email,

            mobile: data.mobile,

            password_hash: hashedPassword

        });

        isNewAccount = true;

    }

    const alreadyLinked = await parentModel.isLinked(

        parentUser.id,

        data.student_id

    );

    if (alreadyLinked) {

        throw new Error("This parent is already linked to this student.");

    }

    const link = await parentModel.linkParentToStudent(

        parentUser.id,

        data.student_id,

        data.relationship

    );

    if (isNewAccount) {

        try {

            await emailService.sendEmail(

                parentUser.email,

                "Your SchoolLink Parent Account",

                `An account has been created for you on SchoolLink.<br><br>` +
                `Email: ${parentUser.email}<br>` +
                `Temporary Password: ${data.temporary_password}<br><br>` +
                `Please log in and change your password.`

            );

        } catch (err) {

            console.error("Failed to send parent welcome email:", err);

        }

    }

    return {

        parent: parentUser,

        link,

        is_new_account: isNewAccount

    };

}

async function getParentsForStudent(studentId) {

    return await parentModel.getParentsForStudent(studentId);

}

module.exports = {

    getMyChildren,

    createOrLinkParent,

    getParentsForStudent

};
