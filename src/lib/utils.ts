import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Donor, Donation } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD', compact = false) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

export function formatNumber(value: number, compact = false) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffDays = Math.round((date.getTime() - Date.now()) / 86_400_000);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffDays) < 7) return formatter.format(diffDays, 'day');
  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 5) return formatter.format(diffWeeks, 'week');
  return formatDate(value, { month: 'short', day: 'numeric' });
}

export function initials(firstName: string, lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function donorName(donor: Donor) {
  return `${donor.firstName} ${donor.lastName}`.trim();
}

export function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

export function uid(prefix = 'id') {
  const value = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
}

export function trend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function sum(items: Donation[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function monthlyTotals(donations: Donation[], months = 12) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const matching = donations.filter((donation) => {
      const created = new Date(donation.date);
      return created >= date && created < nextDate && donation.status === 'Completed';
    });
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: sum(matching),
      donations: matching.length,
    };
  });
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const normalized = value instanceof Date ? value.toISOString() : String(value ?? '');
    return `"${normalized.replace(/"/g, '""')}"`;
  };
  return [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ].join('\n');
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
