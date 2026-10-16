const express = require("express");
const { getUserDashboard } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getUserDashboard);

module.exports = router;