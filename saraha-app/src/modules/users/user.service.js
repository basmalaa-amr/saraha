const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("./user.repository");
const otpService = require("../otp/otp.service");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const register = async ({ userName, email, password }) => {
    email = normalizeEmail(email);

    if (!userName || !email || !password) {
        const error = new Error("userName, email and password are required");
        error.statusCode = 400;
        throw error;
    }
    if (!validateEmail(email)) {
        const error = new Error("Please provide a valid email address");
        error.statusCode = 400;
        throw error;
    }
    if (String(password).length < 8) {
        const error = new Error("Password must be at least 8 characters long");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser && existingUser.isVerified) {
        const error = new Error("An account with this email already exists");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let user;

    if (existingUser) {
        user = await userRepository.updateById(existingUser._id, {
            userName: String(userName).trim(),
            password: hashedPassword,
            provider: "local"
        });
    } else {
        user = await userRepository.createUser({
            userName: String(userName).trim(),
            email,
            password: hashedPassword,
            provider: "local"
        });
    }

    await otpService.createAndSendOtp(user, "verify-email");
    return user;
};

const sendVerificationOtp = async ({ email }) => {
    email = normalizeEmail(email);
    if (!email || !validateEmail(email)) {
        const error = new Error("Please provide a valid email address");
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    if (user.isVerified) {
        const error = new Error("Account is already verified");
        error.statusCode = 400;
        throw error;
    }

    await otpService.createAndSendOtp(user, "verify-email");
};

const verifyAccount = async ({ email, code }) => {
    if (!email || !/^\d{6}$/.test(String(code || ""))) {
        const error = new Error("A valid email and 6-digit code are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await otpService.verifyOtp({
        email: normalizeEmail(email),
        code,
        purpose: "verify-email"
    });

    if (user.isVerified) {
        const error = new Error("Account is already verified");
        error.statusCode = 400;
        throw error;
    }

    await userRepository.updateById(user._id, { isVerified: true });
};

const login = async ({ email, password }) => {
    email = normalizeEmail(email);
    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.findByEmail(email, true);
    if (!user || user.provider !== "local" || !user.password) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isVerified) {
        const error = new Error("Please verify your account before logging in");
        error.statusCode = 403;
        throw error;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from environment variables");
    }

    const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return {
        token,
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email,
            profilePicPath: user.profilePicPath,
            isVerified: user.isVerified
        }
    };
};

const forgotPassword = async ({ email }) => {
    email = normalizeEmail(email);
    if (!email || !validateEmail(email)) {
        const error = new Error("Please provide a valid email address");
        error.statusCode = 400;
        throw error;
    }

    const user = await userRepository.findByEmail(email);
    // Avoid revealing whether an email is registered.
    if (user && user.provider === "local") {
        await otpService.createAndSendOtp(user, "reset-password");
    }
};

const resetPassword = async ({ email, code, newPassword }) => {
    if (!email || !/^\d{6}$/.test(String(code || "")) || !newPassword) {
        const error = new Error("Email, 6-digit code and newPassword are required");
        error.statusCode = 400;
        throw error;
    }
    if (String(newPassword).length < 8) {
        const error = new Error("Password must be at least 8 characters long");
        error.statusCode = 400;
        throw error;
    }

    const user = await otpService.verifyOtp({
        email: normalizeEmail(email),
        code,
        purpose: "reset-password"
    });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(user._id, { password: hashedPassword });
};

module.exports = {
    register,
    sendVerificationOtp,
    verifyAccount,
    login,
    forgotPassword,
    resetPassword
};
