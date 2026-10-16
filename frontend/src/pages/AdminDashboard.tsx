import { useCallback, useEffect, useState } from "react";
import CategoryManager from "../components/CategoryManager";
import { fetchAdminInsights } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import type { AdminInsights, CategorySpending } from "../types";
import { formatDate, formatMoney } from "../utils/format";

function CategoryCountList({ title, items }: { title: string; items: CategorySpending[] }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="muted">No data yet.</p>
      ) : (
        <ol className="plain-list">
          {items.map((c) => (
            <li key={c.categoryId}>
              <span>{c.name}</span>
              <strong>
                {c.count} expense{c.count === 1 ? "" : "s"}
              </strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setInsights(await fetchAdminInsights());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="page-header">
        <h1>Admin dashboard</h1>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading insights...</p>}

      {insights && (
        <>
          <section className="stats">
            <div className="card stat">
              <span className="muted">Registered users</span>
              <strong>{insights.totalUsers}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Total expenses recorded</span>
              <strong>{insights.totalExpenses}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Total value of expenses</span>
              <strong>{formatMoney(insights.totalValue)}</strong>
            </div>
            <div className="card stat">
              <span className="muted">Expenses this month</span>
              <strong>{insights.expensesThisMonth}</strong>
            </div>
          </section>

          <section className="card">
            <h2>Total spending per category</h2>
            <div className="table-wrap">
              <ul className="plain-list">
                {insights.spendingPerCategory.map((c) => (
                  <li key={c.categoryId}>
                    <span>{c.name}</span>
                    <strong>{formatMoney(c.total)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="grid-2">
            <CategoryCountList title="Top 5 most-used categories" items={insights.topCategories} />
            <CategoryCountList title="Bottom 5 least-used categories" items={insights.bottomCategories} />
          </div>

          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <section className="card">
              <h2>Recently added expenses</h2>
              {insights.recentExpenses.length === 0 ? (
                <p className="muted">No expenses yet.</p>
              ) : (
                <ul className="plain-list">
                  {insights.recentExpenses.map((e) => (
                    <li key={e._id}>
                      <span>
                        {e.title}
                        <span className="muted">
                          {" "}
                          · {e.user?.name ?? "Unknown"} · {e.category.name}
                        </span>
                      </span>
                      <strong>{formatMoney(e.amount)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h2>Recently registered users</h2>
              <ul className="plain-list">
                {insights.recentUsers.map((u) => (
                  <li key={u._id}>
                    <span>
                      {u.name}
                      <span className="muted"> · {u.email}</span>
                    </span>
                    <span className="muted">{formatDate(u.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      <div style={{ marginTop: "1rem" }}>
        <CategoryManager onChange={load} />
      </div>
    </div>
  );
}