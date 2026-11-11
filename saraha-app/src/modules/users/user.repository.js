const User = require("./user.model");

const findByEmail = (email, includePassword = false) => {
    const query = User.findOne({ email: email.toLowerCase(), isDeleted: false });
    if (includePassword) query.select("+password");
    return query;
};

const createUser = (data) => User.create(data);

const findById = (id) => User.findOne({ _id: id, isDeleted: false });

const updateById = (id, updates) =>
    User.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updates },
        { new: true, runValidators: true }
    );

module.exports = { findByEmail, createUser, findById, updateById };
