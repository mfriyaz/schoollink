const { body, validationResult } = require("express-validator");

/**
 * Student Validation Rules
 */
const studentValidationRules = [

    body("school_id")
        .notEmpty()
        .withMessage("School ID is required")
        .isInt({ min: 1 })
        .withMessage("School ID must be a positive integer"),

    body("academic_year_id")
        .notEmpty()
        .withMessage("Academic Year ID is required")
        .isInt({ min: 1 })
        .withMessage("Academic Year ID must be a positive integer"),

    body("class_id")
        .notEmpty()
        .withMessage("Class ID is required")
        .isInt({ min: 1 })
        .withMessage("Class ID must be a positive integer"),

    body("section_id")
        .notEmpty()
        .withMessage("Section ID is required")
        .isInt({ min: 1 })
        .withMessage("Section ID must be a positive integer"),

    body("admission_no")
        .trim()
        .notEmpty()
        .withMessage("Admission number is required"),

    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters"),

    body("last_name")
        .trim()
        .optional()
        .isLength({ max: 50 })
        .withMessage("Last name cannot exceed 50 characters"),

    body("gender")
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(["Male", "Female", "Other"])
        .withMessage("Gender must be Male, Female or Other"),

    body("date_of_birth")
        .notEmpty()
        .withMessage("Date of birth is required")
        .isISO8601()
        .withMessage("Invalid date format"),

    body("parent_phone")
        .notEmpty()
        .withMessage("Parent phone is required")
        .isLength({ min: 8, max: 20 })
        .withMessage("Invalid phone number"),

    body("parent_email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Invalid email address")

];

/**
 * Validation Result Handler
 */
function validate(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({

            success: false,
            message: "Validation failed",
            errors: errors.array()

        });

    }

    next();

}

module.exports = {

    studentValidationRules,

    validate

};