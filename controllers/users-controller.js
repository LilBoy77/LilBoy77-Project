import pool from "../config/db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const getAllUsers = async (req, res) => {
    try {
        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // search
        const search = req.query.search || "";

        const response = await pool.query(
            `SELECT id, username, email
             FROM users
             WHERE username ILIKE $1
             ORDER BY id DESC
             LIMIT $2 OFFSET $3`,
            [`%${search}%`, limit, offset]
        );

        const total = await pool.query(
            `SELECT COUNT(*) FROM users
             WHERE username ILIKE $1`,
            [`%${search}%`]
        );

        res.json({
            page,
            limit,
            total_data: parseInt(total.rows[0].count),
            data: response.rows
        });

    } catch (error) {
        console.log(error.message);
    }
};

export const register = async (req, res) => {
    try {

        const { username, email, password } = req.body;

        // cek email
        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length > 0) {
            return res.status(400).json({
                message: "Email sudah digunakan"
            });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // insert user
        const response = await pool.query(
            `INSERT INTO users (username, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, username, email`,
            [username, email, hashPassword]
        );

        res.status(201).json({
            message: "Register berhasil",
            data: response.rows[0]
        });

    } catch (error) {
        console.log(error.message);
    }
};

export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // cek email
        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                message: "Email tidak ditemukan"
            });
        }

        // cek password
        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword) {
            return res.status(400).json({
                message: "Password salah"
            });
        }

        res.json({
            message: "Login berhasil",
            data: {
                id: user.rows[0].id,
                username: user.rows[0].username,
                email: user.rows[0].email
            }
        });

    } catch (error) {
        console.log(error.message);
    }
};