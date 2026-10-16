const Budget = require("../models/Budget");
const Expense = require("../models/Expense");

const currentMonth = () => new Date().toISOString().slice(0, 7);

const isValidMonth = (month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

// Start (inclusive) and end (exclusive) of a "YYYY-MM" month, in UTC
const monthRange = (month) => {
  const [year, m] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1)),
  };
};

const getStatus = (amount, spent) => {
  if (!amount) return "no_budget";
  const ratio = spent / amount;
  if (ratio > 1) return "over";
  if (ratio >= 0.8) return "approaching";
  return "within";
};

const getBudgetSummary = async (userId, month) => {
  const { start, end } = monthRange(month);

  const [budget, spentResult] = await Promise.all([
    Budget.findOne({ user: userId, month }),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const amount = budget?.amount ?? 0;
  const spent = spentResult[0]?.total ?? 0;

  return {
    month,
    hasBudget: Boolean(budget),
    amount,
    spent,
    remaining: amount - spent,
    percentUsed: amount > 0 ? Math.round((spent / amount) * 100) : 0,
    status: getStatus(amount, spent),
  };
};

module.exports = { currentMonth, isValidMonth, monthRange, getBudgetSummary };