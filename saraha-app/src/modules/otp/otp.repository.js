const OTP = require("./otp.model");

const findLatest = (userId, purpose) =>
    OTP.findOne({ userId, purpose }).sort({ createdAt: -1 });

const deleteForUser = (userId, purpose) =>
    OTP.deleteMany({ userId, purpose });

const createOtp = (data) => OTP.create(data);

const deleteById = (id) => OTP.findByIdAndDelete(id);

module.exports = { findLatest, deleteForUser, createOtp, deleteById };
