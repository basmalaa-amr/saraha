require("dotenv").config();

const express = require("express");
const connectDB = require("./config/connection");
const userRoutes = require("./modules/users/user.routes");

const app = express();

app.use(express.json({ limit: "10kb" }));

app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Saraha API is running" });
});

app.use("/users", userRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
    console.error(error);

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists"
        });
    }

    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal server error" : error.message
    });
});

const startServer = async () => {
    try {
        await connectDB();

        const port = Number(process.env.PORT) || 3000;
        app.listen(port, () => {
            console.log(`Saraha API is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;
