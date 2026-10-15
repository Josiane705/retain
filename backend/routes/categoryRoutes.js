const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getCategories);
router.post("/", adminOnly, createCategory);
router.put("/:id", adminOnly, updateCategory);
router.delete("/:id", adminOnly, deleteCategory);

module.exports = router;