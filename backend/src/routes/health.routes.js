const express = require("express");
const router = express.Router();

const pool = require("../config/database");

router.get("/", async (req, res) => {

    try {

        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            status: "healthy",
            application: "SchoolLink",
            version: "1.0.0",
            database: "connected",
            serverTime: result.rows[0].now
        });

    } catch (error) {

        res.status(500).json({
            status: "unhealthy",
            database: "disconnected",
            error: error.message
        });

    }

});

module.exports = router;