import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard, saveBudget } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { BudgetStatus, DashboardData } from "../types";
import { PAYMENT_LABELS, currentMonth, formatDate, formatMoney } from "../utils/format";

const STATUS_LABELS: Record<BudgetStatus, string> = {
  no_budget: "No budget set",
  within: "Within budget",
  approaching: "Approaching budget",
  over: "Over budget",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchDashboard(month);
      setData(result);
      setBudgetInput(result.budget.hasBudget ? String(result.budget.amount) : "");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveBudget = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!(Number(budgetInput) > 0)) return setError("Budget must be greater than 0");

    setSaving(true);
    try {
      await saveBudget(month, Number(budgetInput));
      setMessage("Budget saved");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const maxCategory = Math.max(...(data?.spendingByCategory.map((c) => c.total) ?? [0]), 1);

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name}</h1>
        <label className="month-picker">
          Month
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      {loading && !data && <p className="muted">Loading dashboard...</p>}

      {data && (
        <>
          <section className="stats">
            <div className="card stat">
              <span className="muted">Total spent</span>
              <strong>{formatMoney(data.totalSpent)}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Remaining budget</span>
              <strong>{data.budget.hasBudget ? formatMoney(data.budget.remaining) : "-"}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Highest expense</span>
              <strong>{data.highestExpense ? formatMoney(data.highestExpense.amount) : "-"}</strong>
              {data.highestExpense && <span className="muted">{data.highestExpense.title}</span>}
            </div>
          </section>

          <section className="card">
            <h2>Monthly budget</h2>
            <p>
              <span className={`badge status-${data.budget.status}`}>{STATUS_LABELS[data.budget.status]}</span>
              {data.budget.hasBudget && (
                <span className="muted">
                  {" "}
                  {formatMoney(data.budget.spent)} of {formatMoney(data.budget.amount)} used ({data.budget.percentUsed}%)
                </span>
              )}
            </p>

            {data.budget.hasBudget && (
              <div className="progress">
                <div
                  className={`progress-bar status-${data.budget.status}`}
                  style={{ width: `${Math.min(data.budget.percentUsed, 100)}%` }}
                />
              </div>
            )}

            <form className="inline-form" onSubmit={handleSaveBudget}>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Budget amount (RWF)"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : data.budget.hasBudget ? "Update budget" : "Set budget"}
              </button>
            </form>
          </section>

          <section className="card">
            <h2>Spending by category</h2>
            {data.spendingByCategory.length === 0 ? (
              <p className="muted">No expenses this month.</p>
            ) : (
              <ul className="bars">
                {data.spendingByCategory.map((c) => (
                  <li key={c.categoryId}>
                    <div className="bar-label">
                      <span>{c.name}</span>
                      <span>{formatMoney(c.total)}</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${(c.total / maxCategory) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="page-header">
              <h2>Recent expenses</h2>
              <Link to="/expenses" className="link-button">
                View all
              </Link>
            </div>
            {data.recentExpenses.length === 0 ? (
              <p className="muted">No expenses this month.</p>
            ) : (
              <ul className="expense-list">
                {data.recentExpenses.map((e) => (
                  <li key={e._id} className="expense-card">
                    <div className="expense-main">
                      <Link to={`/expenses/${e._id}`} className="expense-title">
                        {e.title}
                      </Link>
                      <span className="expense-meta">
                        {e.category.name} · {PAYMENT_LABELS[e.paymentMethod]} · {formatDate(e.date)}
                      </span>
                    </div>
                    <strong className="expense-amount">{formatMoney(e.amount)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}