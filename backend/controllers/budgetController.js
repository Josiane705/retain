const Budget = require("../models/Budget");
const { currentMonth, isValidMonth, getBudgetSummary } = require("../utils/budgetSummary");

const serverError = (res, err) =>
  res.status(500).json({ message: "Server error", error: err.message });

// GET /api/budgets?month=2026-10  (defaults to the current month)
exports.getBudget = async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    if (!isValidMonth(month)) {
      return res.status(400).json({ message: "Month must be in YYYY-MM format" });
    }
    const summary = await getBudgetSummary(req.user._id, month);
    res.json(summary);
  } catch (err) {
    serverError(res, err);
  }
};

// PUT /api/budgets  body: { month, amount }  (creates or updates)
exports.setBudget = async (req, res) => {
  try {
    const month = req.body.month || currentMonth();
    const amount = Number(req.body.amount);

    if (!isValidMonth(month)) {
      return res.status(400).json({ message: "Month must be in YYYY-MM format" });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Budget amount must be greater than 0" });
    }

    await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { amount },
      { upsert: true, new: true, runValidators: true }
    );

    const summary = await getBudgetSummary(req.user._id, month);
    res.json(summary);
  } catch (err) {
    serverError(res, err);
  }
};