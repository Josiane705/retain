const express = require("express");
const { getBudget, setBudget } = require("../controllers/budgetController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getBudget);
router.put("/", setBudget);

module.exports = router;