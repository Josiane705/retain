import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createExpense,
  fetchCategories,
  fetchExpense,
  updateExpense,
} from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import type { Category, PaymentMethod } from "../types";
import { PAYMENT_LABELS, PAYMENT_METHODS, toInputDate } from "../utils/format";

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);

        if (id) {
          const expense = await fetchExpense(id);
          setTitle(expense.title);
          setAmount(String(expense.amount));
          setCategory(expense.category._id);
          setDate(toInputDate(expense.date));
          setPaymentMethod(expense.paymentMethod);
          setNotes(expense.notes ?? "");
        } else if (cats.length > 0) {
          setCategory(cats[0]._id);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (!(Number(amount) > 0)) return setError("Amount must be greater than 0");
    if (!category) return setError("Please choose a category");

    const payload = {
      title: title.trim(),
      amount: Number(amount),
      category,
      date,
      paymentMethod,
      notes,
    };

    setSaving(true);
    try {
      if (id) {
        await updateExpense(id, payload);
      } else {
        await createExpense(payload);
      }
      navigate("/expenses");
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? "Edit expense" : "Add expense"}</h1>
        <Link to="/expenses" className="link-button">
          Back to expenses
        </Link>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lunch" required />
        </label>

        <label>
          Amount (RWF)
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>

        <label>
          Payment method
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes (optional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add expense"}
        </button>
      </form>
    </div>
  );
}