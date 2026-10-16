import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  resetFilters,
  setAmountRange,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
} from "../store/filtersSlice";
import type { Category, PaymentMethod } from "../types";
import { PAYMENT_LABELS, PAYMENT_METHODS } from "../utils/format";

interface Props {
  categories: Category[];
}

export default function ExpenseFilters({ categories }: Props) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  const handleSort = (value: string) => {
    const [sortBy, order] = value.split("_") as ["date" | "amount", "asc" | "desc"];
    dispatch(setSort({ sortBy, order }));
  };

  return (
    <section className="filters">
      <input
        type="search"
        placeholder="Search by title or notes"
        value={filters.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
      />

      <select value={filters.category} onChange={(e) => dispatch(setCategory(e.target.value))}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={filters.paymentMethod}
        onChange={(e) => dispatch(setPaymentMethod(e.target.value as PaymentMethod | ""))}
      >
        <option value="">All payment methods</option>
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {PAYMENT_LABELS[m]}
          </option>
        ))}
      </select>

      <label>
        From
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            dispatch(setDateRange({ startDate: e.target.value, endDate: filters.endDate }))
          }
        />
      </label>

      <label>
        To
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            dispatch(setDateRange({ startDate: filters.startDate, endDate: e.target.value }))
          }
        />
      </label>

      <input
        type="number"
        min="0"
        placeholder="Min amount"
        value={filters.minAmount}
        onChange={(e) =>
          dispatch(setAmountRange({ minAmount: e.target.value, maxAmount: filters.maxAmount }))
        }
      />

      <input
        type="number"
        min="0"
        placeholder="Max amount"
        value={filters.maxAmount}
        onChange={(e) =>
          dispatch(setAmountRange({ minAmount: filters.minAmount, maxAmount: e.target.value }))
        }
      />

      <select value={`${filters.sortBy}_${filters.order}`} onChange={(e) => handleSort(e.target.value)}>
        <option value="date_desc">Date: newest first</option>
        <option value="date_asc">Date: oldest first</option>
        <option value="amount_desc">Amount: highest first</option>
        <option value="amount_asc">Amount: lowest first</option>
      </select>

      <button type="button" className="secondary" onClick={() => dispatch(resetFilters())}>
        Clear filters
      </button>
    </section>
  );
}