import { Link } from "react-router-dom";
import type { Expense } from "../types";
import { PAYMENT_LABELS, formatDate, formatMoney } from "../utils/format";

interface Props {
  expenses: Expense[];
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, page, pages, total, onPageChange, onDelete }: Props) {
  if (expenses.length === 0) {
    return <p className="empty">No expenses found. Add one or change your filters.</p>;
  }

  return (
    <>
      <p className="muted">
        {total} expense{total === 1 ? "" : "s"} found
      </p>

      <ul className="expense-list">
        {expenses.map((expense) => (
          <li key={expense._id} className="expense-card">
            <div className="expense-main">
              <Link to={`/expenses/${expense._id}`} className="expense-title">
                {expense.title}
              </Link>
              <span className="expense-meta">
                {expense.category.name} · {PAYMENT_LABELS[expense.paymentMethod]} · {formatDate(expense.date)}
              </span>
            </div>

            <strong className="expense-amount">{formatMoney(expense.amount)}</strong>

            <div className="expense-actions">
              <Link to={`/expenses/${expense._id}`} className="link-button">
                View
              </Link>
              <Link to={`/expenses/${expense._id}/edit`} className="link-button">
                Edit
              </Link>
              <button type="button" className="danger" onClick={() => onDelete(expense)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {pages}
          </span>
          <button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
            Next
          </button>
        </nav>
      )}
    </>
  );
}