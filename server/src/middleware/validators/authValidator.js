const { body } = require("express-validator");

const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .escape()
    .isLength({ max: 50 })
    .withMessage("Name must be at most 50 characters"),

  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 128 })
    .withMessage("Password must be at most 128 characters"),
];

const loginRules = [
  body("email")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Password must be at most 128 characters"),
];

module.exports = { registerRules, loginRules };
