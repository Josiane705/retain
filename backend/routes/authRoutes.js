const express = require("express");
const { signup, signin, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", protect, me);

module.exports = router;