import { describe, expect, it } from 'vitest';
import { monthlyTotals, percent, toCsv, trend } from './utils';
import type { Donation } from '@/types';

const donation = (id: string, amount: number, date: Date): Donation => ({
  id,
  donorId: 'donor-1',
  campaignId: 'campaign-1',
  amount,
  date: date.toISOString(),
  status: 'Completed',
  paymentMethod: 'Card',
  channel: 'Online',
  recurring: false,
  reference: id,
});

describe('analytics utilities', () => {
  it('calculates trend percentages', () => {
    expect(trend(125, 100)).toBe(25);
    expect(trend(50, 100)).toBe(-50);
  });

  it('caps progress percentages at 100', () => {
    expect(percent(150, 100)).toBe(100);
    expect(percent(25, 100)).toBe(25);
  });

  it('groups completed gifts into non-overlapping monthly totals', () => {
    const now = new Date();
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 15);
    const result = monthlyTotals([
      donation('one', 100, now),
      donation('two', 200, previous),
      donation('three', 300, twoMonthsAgo),
    ], 3);
    expect(result).toHaveLength(3);
    expect(result.map((item) => item.amount)).toEqual([300, 200, 100]);
    expect(result.map((item) => item.donations)).toEqual([1, 1, 1]);
  });

  it('escapes CSV values safely', () => {
    const csv = toCsv([{ name: 'Maya "The Builder" Chen', amount: 250 }]);
    expect(csv).toContain('"Maya ""The Builder"" Chen"');
  });
});
