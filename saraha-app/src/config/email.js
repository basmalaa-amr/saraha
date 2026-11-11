const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
    if (transporter) return transporter;

    const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
        throw new Error("Email configuration is incomplete. Check EMAIL_* variables in .env");
    }

    transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: String(EMAIL_SECURE).toLowerCase() === "true",
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    return transporter;
};

const sendOtpEmail = async ({ to, code, purpose }) => {
    const transporter = getTransporter();

    const subject = purpose === "reset-password"
        ? "Reset your Saraha password"
        : "Verify your Saraha account";

    const action = purpose === "reset-password"
        ? "use this code to reset your password"
        : "use this code to verify your email address";

    return transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text: `Your Saraha verification code is ${code}. Please ${action}. It expires in ${process.env.OTP_EXPIRES_IN_MINUTES || 10} minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
                <h2>${subject}</h2>
                <p>Please ${action}.</p>
                <p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p>
                <p>This code expires in ${process.env.OTP_EXPIRES_IN_MINUTES || 10} minutes.</p>
                <p>If you did not request this, you can ignore this email.</p>
            </div>
        `
    });
};

module.exports = { sendOtpEmail };
