import { useMemo } from 'react';
import { retentionRate } from '@/lib/analytics';
import { monthlyTotals } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

export function useAnalytics() {
  const donations = useAppStore((state) => state.donations);
  const donors = useAppStore((state) => state.donors);
  const campaigns = useAppStore((state) => state.campaigns);
  return useMemo(() => ({
    monthly: monthlyTotals(donations),
    retentionRate: retentionRate(donations),
    donorCount: donors.length,
    donationCount: donations.length,
    campaignCount: campaigns.length,
  }), [donations, donors, campaigns]);
}
