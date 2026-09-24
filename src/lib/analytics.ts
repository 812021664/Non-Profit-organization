import type { Donation } from '@/types';
import { sum } from './utils';

export function completedDonations(donations: Donation[]) {
  return donations.filter((donation) => donation.status === 'Completed');
}

export function dateWindow(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  return start;
}

export function inCurrentPeriod(donation: Donation, days: number) {
  return new Date(donation.date) >= dateWindow(days);
}

export function periodStats(donations: Donation[], days: number) {
  const current = completedDonations(donations).filter((donation) => inCurrentPeriod(donation, days));
  const previousStart = new Date(dateWindow(days));
  previousStart.setDate(previousStart.getDate() - days);
  const previousEnd = new Date(dateWindow(days));
  const previous = completedDonations(donations).filter((donation) => {
    const date = new Date(donation.date);
    return date >= previousStart && date < previousEnd;
  });
  return {
    current,
    previous,
    amount: sum(current),
    previousAmount: sum(previous),
    count: current.length,
  };
}

export function retentionRate(donations: Donation[]) {
  const completed = completedDonations(donations);
  const cutoff = dateWindow(90);
  const recent = new Set(completed.filter((item) => new Date(item.date) >= cutoff).map((item) => item.donorId));
  const priorCutoff = new Date(cutoff);
  priorCutoff.setDate(priorCutoff.getDate() - 90);
  const prior = new Set(completed.filter((item) => {
    const date = new Date(item.date);
    return date >= priorCutoff && date < cutoff;
  }).map((item) => item.donorId));
  const eligible = new Set([...recent, ...prior]);
  if (!eligible.size) return 0;
  const retained = [...eligible].filter((id) => recent.has(id)).length;
  return (retained / eligible.size) * 100;
}
