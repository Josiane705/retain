export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  _id: string;
  name: string;
  isDefault: boolean;
}

export type PaymentMethod = "cash" | "card" | "mobile_money" | "bank_transfer";

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: { _id: string; name: string };
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  pages: number;
}

export type BudgetStatus = "no_budget" | "within" | "approaching" | "over";

export interface BudgetSummary {
  month: string;
  hasBudget: boolean;
  amount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  total: number;
  count: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: Expense[];
}

export interface AdminExpense extends Expense {
  user: { _id: string; name: string; email: string };
}

export interface RecentUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalValue: number;
  expensesThisMonth: number;
  spendingPerCategory: CategorySpending[];
  topCategories: CategorySpending[];
  bottomCategories: CategorySpending[];
  recentExpenses: AdminExpense[];
  recentUsers: RecentUser[];
}