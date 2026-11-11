const userService = require("./user.service");

const register = async (req, res, next) => {
    try {
        const user = await userService.register(req.body);
        res.status(201).json({
            success: true,
            message: "Registration successful. Check your email for the verification code.",
            data: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        next(error);
    }
};

const sendOtp = async (req, res, next) => {
    try {
        await userService.sendVerificationOtp(req.body);
        res.status(200).json({ success: true, message: "Verification code sent if the account can receive one." });
    } catch (error) {
        next(error);
    }
};

const verifyAccount = async (req, res, next) => {
    try {
        await userService.verifyAccount(req.body);
        res.status(200).json({ success: true, message: "Account verified successfully" });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.status(200).json({ success: true, message: "Login successful", data: result });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        await userService.forgotPassword(req.body);
        res.status(200).json({
            success: true,
            message: "If a local account exists for this email, a password reset code has been sent."
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        await userService.resetPassword(req.body);
        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, sendOtp, verifyAccount, login, forgotPassword, resetPassword };
