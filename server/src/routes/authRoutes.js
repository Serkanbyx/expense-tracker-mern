const { Router } = require("express");
const { register, login, getMe } = require("../controllers/authController");
const {
  registerRules,
  loginRules,
} = require("../middleware/validators/authValidator");
const validate = require("../middleware/validate");
const authenticate = require("../middleware/auth");

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", authenticate, getMe);

module.exports = router;
