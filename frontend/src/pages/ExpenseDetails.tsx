import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteExpense, fetchExpense } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import type { Expense } from "../types";
import { PAYMENT_LABELS, formatDate, formatMoney } from "../utils/format";

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchExpense(id)
      .then(setExpense)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!expense || !window.confirm(`Delete "${expense.title}"?`)) return;
    try {
      await deleteExpense(expense._id);
      navigate("/expenses");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  if (!expense) {
    return (
      <div>
        <p className="error">{error || "Expense not found"}</p>
        <Link to="/expenses" className="link-button">
          Back to expenses
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>{expense.title}</h1>
        <Link to="/expenses" className="link-button">
          Back to expenses
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="card details">
        <dl>
          <dt>Amount</dt>
          <dd>{formatMoney(expense.amount)}</dd>

          <dt>Category</dt>
          <dd>{expense.category.name}</dd>

          <dt>Date</dt>
          <dd>{formatDate(expense.date)}</dd>

          <dt>Payment method</dt>
          <dd>{PAYMENT_LABELS[expense.paymentMethod]}</dd>

          <dt>Notes</dt>
          <dd>{expense.notes || "No notes"}</dd>

          <dt>Recorded on</dt>
          <dd>{formatDate(expense.createdAt)}</dd>
        </dl>

        <div className="expense-actions">
          <Link to={`/expenses/${expense._id}/edit`} className="link-button primary">
            Edit
          </Link>
          <button type="button" className="danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </section>
    </div>
  );
}