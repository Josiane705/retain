import type { PaymentMethod } from "../types";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  card: "Card",
  mobile_money: "Mobile money",
  bank_transfer: "Bank transfer",
};

export const PAYMENT_METHODS = Object.keys(PAYMENT_LABELS) as PaymentMethod[];

const moneyFormat = new Intl.NumberFormat("en-RW", {
  style: "currency",
  currency: "RWF",
  maximumFractionDigits: 0,
});

export const formatMoney = (amount: number): string => moneyFormat.format(amount);

// Dates are stored at UTC midnight, so format them in UTC to avoid shifting a day
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// "2026-10-15T00:00:00.000Z" -> "2026-10-15" (for <input type="date">)
export const toInputDate = (iso: string): string => iso.slice(0, 10);

// Current month as "YYYY-MM"
export const currentMonth = (): string => new Date().toISOString().slice(0, 7);