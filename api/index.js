import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import UsersRouter from "../routes/users-router.js";
import ProductsRouter from "../routes/products-router.js";

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: [
            "http://localhost:5173",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());

// Main Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Running Successfully 🚀",
    });
});

// API Routes
app.use("/api/users", UsersRouter);
app.use("/api/products", ProductsRouter);

// Route Not Found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
});

const PORT = process.env.SERVER_PORT || 3000;

// Kode ini hanya akan jalan di komputer lokal (development)
// Di Vercel, blok ini tidak akan dieksekusi
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export app untuk Vercel
export default app;