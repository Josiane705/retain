const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Category = require("../models/Category");

const PAYMENT_METHODS = ["cash", "card", "mobile_money", "bank_transfer"];

const serverError = (res, err) =>
  res.status(500).json({ message: "Server error", error: err.message });

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateExpense = async ({ title, amount, category, date, paymentMethod }) => {
  if (!title?.trim()) return "Title is required";
  if (!(Number(amount) > 0)) return "Amount must be greater than 0";
  if (!PAYMENT_METHODS.includes(paymentMethod)) return "Invalid payment method";
  if (!mongoose.isValidObjectId(category)) return "Invalid category";
  if (!(await Category.exists({ _id: category }))) return "Category not found";
  if (date && isNaN(new Date(date).getTime())) return "Invalid date";
  return null;
};

// GET /api/expenses?search=&category=&paymentMethod=&startDate=&endDate=&minAmount=&maxAmount=&sortBy=date|amount&order=asc|desc&page=1&limit=10
exports.getExpenses = async (req, res) => {
  try {
    const {
      search, category, paymentMethod, startDate, endDate,
      minAmount, maxAmount, sortBy = "date", order = "desc",
    } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

    const filter = { user: req.user._id };

    if (search?.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ title: regex }, { notes: regex }];
    }
    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      filter.category = category;
    }
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999); // include the whole end day
        filter.date.$lte = end;
      }
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    const sortField = sortBy === "amount" ? "amount" : "date";
    const sortDirection = order === "asc" ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate("category", "name")
        .sort({ [sortField]: sortDirection, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Expense.countDocuments(filter),
    ]);

    res.json({ expenses, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    serverError(res, err);
  }
};

// GET /api/expenses/:id
exports.getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid expense id" });

    const expense = await Expense.findOne({ _id: id, user: req.user._id }).populate("category", "name");
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.json(expense);
  } catch (err) {
    serverError(res, err);
  }
};

// POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const error = await validateExpense(req.body);
    if (error) return res.status(400).json({ message: error });

    const { title, amount, category, date, paymentMethod, notes } = req.body;
    const expense = await Expense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category,
      date: date || Date.now(),
      paymentMethod,
      notes,
    });
    await expense.populate("category", "name");

    res.status(201).json(expense);
  } catch (err) {
    serverError(res, err);
  }
};

// PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid expense id" });

    const error = await validateExpense(req.body);
    if (error) return res.status(400).json({ message: error });

    const { title, amount, category, date, paymentMethod, notes } = req.body;
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title: title.trim(), amount: Number(amount), category, date: date || Date.now(), paymentMethod, notes },
      { new: true, runValidators: true }
    ).populate("category", "name");

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    serverError(res, err);
  }
};

// DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid expense id" });

    const expense = await Expense.findOneAndDelete({ _id: id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.json({ message: "Expense deleted" });
  } catch (err) {
    serverError(res, err);
  }
};