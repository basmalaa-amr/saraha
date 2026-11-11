const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        purpose: {
            type: String,
            enum: ["verify-email", "reset-password"],
            required: true
        },
        expireAt: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { versionKey: false }
);

otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userId: 1, purpose: 1 });

module.exports = mongoose.model("OTP", otpSchema);
