const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.DB_NAME;

    if (!mongoUri) {
        throw new Error("MONGO_URI is missing from environment variables");
    }

    await mongoose.connect(mongoUri, dbName ? { dbName } : {});
    console.log(`MongoDB connected${dbName ? ` to ${dbName}` : ""}`);
};

module.exports = connectDB;
