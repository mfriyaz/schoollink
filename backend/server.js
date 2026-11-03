require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/database");

const PORT = process.env.PORT || 3001;

async function startServer() {

    try {

        await pool.query("SELECT NOW()");

        console.log("✅ PostgreSQL Connected Successfully");

        app.listen(PORT, () => {

            console.log(`🚀 SchoolLink Server is running on port ${PORT}`);

            require("./src/services/subscriptionLock.service").start();

            require("./src/services/attentionDigest.service").start();

        });

    } catch (err) {

        console.error("❌ Database Connection Failed");

        console.error(err.message);

        process.exit(1);

    }

}

startServer();