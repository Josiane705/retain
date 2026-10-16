const User = require("../models/User");
const Expense = require("../models/Expense");
const Category = require("../models/Category");
const { currentMonth, monthRange } = require("../utils/budgetSummary");

// GET /api/admin/insights
exports.getInsights = async (req, res) => {
  try {
    const { start, end } = monthRange(currentMonth());

    const [
      totalUsers,
      totalExpenses,
      valueResult,
      expensesThisMonth,
      categoryStats,
      recentExpenses,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Expense.countDocuments({ date: { $gte: start, $lt: end } }),
      // Every category with how many expenses it has and their total value
      Category.aggregate([
        { $lookup: { from: "expenses", localField: "_id", foreignField: "category", as: "expenses" } },
        {
          $project: {
            _id: 0,
            categoryId: "$_id",
            name: 1,
            count: { $size: "$expenses" },
            total: { $sum: "$expenses.amount" },
          },
        },
      ]),
      Expense.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("category", "name")
        .populate("user", "name email"),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
    ]);

    const byName = (a, b) => a.name.localeCompare(b.name);

    res.json({
      totalUsers,
      totalExpenses,
      totalValue: valueResult[0]?.total ?? 0,
      expensesThisMonth,
      spendingPerCategory: [...categoryStats].sort((a, b) => b.total - a.total || byName(a, b)),
      topCategories: [...categoryStats].sort((a, b) => b.count - a.count || byName(a, b)).slice(0, 5),
      bottomCategories: [...categoryStats].sort((a, b) => a.count - b.count || byName(a, b)).slice(0, 5),
      recentExpenses,
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};