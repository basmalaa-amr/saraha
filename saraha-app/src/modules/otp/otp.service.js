const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const otpRepository = require("./otp.repository");
const userRepository = require("../users/user.repository");
const { sendOtpEmail } = require("../../config/email");

const OTP_LENGTH = 6;

const generateCode = () =>
    crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");

const createAndSendOtp = async (user, purpose) => {
    const cooldownSeconds = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
    const latestOtp = await otpRepository.findLatest(user._id, purpose);

    if (latestOtp) {
        const elapsedSeconds = (Date.now() - latestOtp.createdAt.getTime()) / 1000;
        if (elapsedSeconds < cooldownSeconds) {
            const waitSeconds = Math.ceil(cooldownSeconds - elapsedSeconds);
            const error = new Error(`Please wait ${waitSeconds} seconds before requesting another code`);
            error.statusCode = 429;
            throw error;
        }
    }

    const plainCode = generateCode();
    const hashedCode = await bcrypt.hash(plainCode, 10);
    const expiresInMinutes = Number(process.env.OTP_EXPIRES_IN_MINUTES || 10);

    await otpRepository.deleteForUser(user._id, purpose);
    await otpRepository.createOtp({
        code: hashedCode,
        userId: user._id,
        purpose,
        expireAt: new Date(Date.now() + expiresInMinutes * 60 * 1000)
    });

    try {
        await sendOtpEmail({ to: user.email, code: plainCode, purpose });
    } catch (error) {
        await otpRepository.deleteForUser(user._id, purpose);
        throw new Error(`Could not send the email. Check your email configuration. (${error.message})`);
    }
};

const verifyOtp = async ({ email, code, purpose }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        const error = new Error("Invalid email or code");
        error.statusCode = 400;
        throw error;
    }

    const otp = await otpRepository.findLatest(user._id, purpose);
    if (!otp || otp.expireAt.getTime() <= Date.now()) {
        const error = new Error("Code is invalid or expired");
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await bcrypt.compare(String(code), otp.code);
    if (!isMatch) {
        const error = new Error("Code is invalid or expired");
        error.statusCode = 400;
        throw error;
    }

    await otpRepository.deleteById(otp._id);
    return user;
};

module.exports = { createAndSendOtp, verifyOtp };
