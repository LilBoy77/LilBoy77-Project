import pool from "../config/db.js";


// GET ALL PRODUCTS + SEARCH + FILTER + PAGINATION
export const getAllProducts = async (req, res) => {
    try {

        // pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // search
        const search = req.query.search || "";

        // filter
        const minPrice = req.query.minPrice || 0;
        const maxPrice = req.query.maxPrice || 999999999;

        const response = await pool.query(
            `SELECT * FROM products
             WHERE name ILIKE $1
             AND price BETWEEN $2 AND $3
             ORDER BY id DESC
             LIMIT $4 OFFSET $5`,
            [
                `%${search}%`,
                minPrice,
                maxPrice,
                limit,
                offset
            ]
        );

        const total = await pool.query(
            `SELECT COUNT(*) FROM products
             WHERE name ILIKE $1
             AND price BETWEEN $2 AND $3`,
            [
                `%${search}%`,
                minPrice,
                maxPrice
            ]
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

// GET PRODUCT BY ID
export const getProductById = async (req, res) => {
    try {

        const response = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [req.params.id]
        );

        res.json(response.rows[0]);

    } catch (error) {
        console.log(error.message);
    }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
    try {

        const { name, price, stock } = req.body;

        const response = await pool.query(
            `INSERT INTO products (name, price, stock)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, price, stock]
        );

        res.status(201).json({
            message: "Product berhasil ditambahkan",
            data: response.rows[0]
        });

    } catch (error) {
        console.log(error.message);
    }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        await pool.query(
            `UPDATE products
             SET name = $1,
                 price = $2,
                 stock = $3
             WHERE id = $4`,
            [name, price, stock, req.params.id]
        );

        res.json({
            message: "Product berhasil diupdate"
        });

    } catch (error) {
        console.log(error.message);
    }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM products WHERE id = $1",
            [req.params.id]
        );

        res.json({
            message: "Product berhasil dihapus"
        });

    } catch (error) {
        console.log(error.message);
    }
};