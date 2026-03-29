import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function getPeriodDates(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDate();
  let start: Date, end: Date;

  if (day >= 16) {
    start = new Date(now.getFullYear(), now.getMonth(), 16);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 16);
    end = new Date(now.getFullYear(), now.getMonth(), 15);
  }

  return { start, end };
}
