import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseList from "../components/ExpenseList";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPage } from "../store/filtersSlice";
import { deleteExpense, fetchCategories, fetchExpenses } from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import type { Category, Expense, ExpenseListResponse } from "../types";

export default function Expenses() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ExpenseListResponse>({ expenses: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchExpenses(filters));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Reload whenever the Redux filters change (short delay while the user types)
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete "${expense.title}"?`)) return;
    try {
      await deleteExpense(expense._id);
      // If that was the last item on the page, go back one page
      if (data.expenses.length === 1 && filters.page > 1) {
        dispatch(setPage(filters.page - 1));
      } else {
        await load();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Expenses</h1>
        <Link to="/expenses/new" className="link-button primary">
          + Add expense
        </Link>
      </div>

      <ExpenseFilters categories={categories} />

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading expenses...</p>
      ) : (
        <ExpenseList
          expenses={data.expenses}
          page={data.page}
          pages={data.pages}
          total={data.total}
          onPageChange={(page) => dispatch(setPage(page))}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}