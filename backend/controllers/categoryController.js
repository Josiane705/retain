const mongoose = require("mongoose");
const Category = require("../models/Category");
const Expense = require("../models/Expense");

const serverError = (res, err) =>
  res.status(500).json({ message: "Server error", error: err.message });

const findByName = (name) =>
  Category.findOne({ name }).collation({ locale: "en", strength: 2 });

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    serverError(res, err);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: "Category name is required" });

    if (await findByName(name)) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    serverError(res, err);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid category id" });

    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.isDefault) {
      return res.status(400).json({ message: "The default category cannot be edited" });
    }

    const duplicate = await findByName(name);
    if (duplicate && duplicate._id.toString() !== id) {
      return res.status(409).json({ message: "Category already exists" });
    }

    category.name = name;
    await category.save();
    res.json(category);
  } catch (err) {
    serverError(res, err);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid category id" });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.isDefault) {
      return res.status(400).json({ message: "The default category cannot be deleted" });
    }

    // Move this category's expenses to the default category
    const fallback = await Category.findOne({ isDefault: true });
    const result = await Expense.updateMany({ category: id }, { category: fallback._id });

    await category.deleteOne();
    res.json({
      message: "Category deleted",
      expensesMovedToDefault: result.modifiedCount,
    });
  } catch (err) {
    serverError(res, err);
  }
};