const express = require("express");
const rateLimit = require("express-rate-limit");
const userController = require("./user.controller");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication requests. Please try again later."
    }
});

router.post("/register", authLimiter, userController.register);
router.post("/send-otp", authLimiter, userController.sendOtp);
router.post("/verify-account", authLimiter, userController.verifyAccount);
router.post("/login", authLimiter, userController.login);
router.post("/forget-password", authLimiter, userController.forgotPassword);
router.post("/reset-password", authLimiter, userController.resetPassword);

module.exports = router;
