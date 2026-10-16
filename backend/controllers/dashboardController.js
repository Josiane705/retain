const Expense = require("../models/Expense");
const { currentMonth, isValidMonth, monthRange, getBudgetSummary } = require("../utils/budgetSummary");

// GET /api/dashboard?month=2026-10  (defaults to the current month)
exports.getUserDashboard = async (req, res) => {
  try {
    const month = req.query.month || currentMonth();
    if (!isValidMonth(month)) {
      return res.status(400).json({ message: "Month must be in YYYY-MM format" });
    }

    const { start, end } = monthRange(month);
    const match = { user: req.user._id, date: { $gte: start, $lt: end } };

    const [budget, highestExpense, spendingByCategory, recentExpenses] = await Promise.all([
      getBudgetSummary(req.user._id, month),
      Expense.findOne(match).sort({ amount: -1 }).populate("category", "name"),
      Expense.aggregate([
        { $match: match },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "cat" } },
        { $unwind: "$cat" },
        { $project: { _id: 0, categoryId: "$_id", name: "$cat.name", total: 1, count: 1 } },
        { $sort: { total: -1 } },
      ]),
      Expense.find(match).sort({ date: -1, _id: -1 }).limit(5).populate("category", "name"),
    ]);

    res.json({
      month,
      totalSpent: budget.spent,
      budget,
      highestExpense,
      spendingByCategory,
      recentExpenses,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};