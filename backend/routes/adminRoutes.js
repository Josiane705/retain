const express = require("express");
const { getInsights } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/insights", getInsights);

module.exports = router;