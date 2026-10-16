import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../services/endpoints";
import { getErrorMessage } from "../services/api";
import type { Category } from "../types";

interface Props {
  onChange?: () => void;
}

export default function CategoryManager({ onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setCategories(await fetchCategories());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const done = async (text: string) => {
    setMessage(text);
    setError("");
    await load();
    onChange?.();
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!newName.trim()) return setError("Category name is required");
    try {
      await createCategory(newName.trim());
      setNewName("");
      await done("Category created");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category._id);
    setEditName(category.name);
    setError("");
    setMessage("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return setError("Category name is required");
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      await done("Category updated");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (category: Category) => {
    const ok = window.confirm(
      `Delete "${category.name}"? Its expenses will be moved to Uncategorized.`
    );
    if (!ok) return;
    try {
      const result = await deleteCategory(category._id);
      await done(
        `Category deleted. ${result.expensesMovedToDefault} expense(s) moved to Uncategorized.`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="card">
      <h2>Expense categories</h2>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit">Add category</button>
      </form>

      <ul className="plain-list">
        {categories.map((category) => (
          <li key={category._id}>
            {editingId === category._id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <span className="row-actions">
                  <button type="button" onClick={() => handleUpdate(category._id)}>
                    Save
                  </button>
                  <button type="button" className="secondary" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </span>
              </>
            ) : (
              <>
                <span>
                  {category.name}
                  {category.isDefault && <span className="muted"> (default)</span>}
                </span>
                {!category.isDefault && (
                  <span className="row-actions">
                    <button type="button" onClick={() => startEdit(category)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(category)}>
                      Delete
                    </button>
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}