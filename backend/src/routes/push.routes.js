const express = require("express");

const router = express.Router();

const controller = require("../controllers/push.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/public-key", authenticate, controller.getPublicKey);
router.post("/subscribe", authenticate, controller.subscribe);
router.post("/unsubscribe", authenticate, controller.unsubscribe);

module.exports = router;
