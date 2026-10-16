import api from "./api";
import type {
  AdminInsights,
  BudgetSummary,
  Category,
  DashboardData,
  Expense,
  ExpenseInput,
  ExpenseListResponse,
} from "../types";

export interface ExpenseQuery {
  search?: string;
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: "date" | "amount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Expenses
export const fetchExpenses = async (query: ExpenseQuery): Promise<ExpenseListResponse> => {
  // Only send filters that have a value
  const params = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== "" && value !== undefined)
  );
  const res = await api.get<ExpenseListResponse>("/expenses", { params });
  return res.data;
};

export const fetchExpense = async (id: string): Promise<Expense> => {
  const res = await api.get<Expense>(`/expenses/${id}`);
  return res.data;
};

export const createExpense = async (data: ExpenseInput): Promise<Expense> => {
  const res = await api.post<Expense>("/expenses", data);
  return res.data;
};

export const updateExpense = async (id: string, data: ExpenseInput): Promise<Expense> => {
  const res = await api.put<Expense>(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get<Category[]>("/categories");
  return res.data;
};

export const createCategory = async (name: string): Promise<Category> => {
  const res = await api.post<Category>("/categories", { name });
  return res.data;
};

export const updateCategory = async (id: string, name: string): Promise<Category> => {
  const res = await api.put<Category>(`/categories/${id}`, { name });
  return res.data;
};

export const deleteCategory = async (id: string): Promise<{ expensesMovedToDefault: number }> => {
  const res = await api.delete<{ expensesMovedToDefault: number }>(`/categories/${id}`);
  return res.data;
};

// Budget and dashboards
export const fetchBudget = async (month: string): Promise<BudgetSummary> => {
  const res = await api.get<BudgetSummary>("/budgets", { params: { month } });
  return res.data;
};

export const saveBudget = async (month: string, amount: number): Promise<BudgetSummary> => {
  const res = await api.put<BudgetSummary>("/budgets", { month, amount });
  return res.data;
};

export const fetchDashboard = async (month: string): Promise<DashboardData> => {
  const res = await api.get<DashboardData>("/dashboard", { params: { month } });
  return res.data;
};

export const fetchAdminInsights = async (): Promise<AdminInsights> => {
  const res = await api.get<AdminInsights>("/admin/insights");
  return res.data;
};