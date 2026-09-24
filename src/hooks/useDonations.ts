import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function useDonations() {
  const donations = useAppStore((state) => state.donations);
  const addDonation = useAppStore((state) => state.addDonation);
  const completed = useMemo(() => donations.filter((donation) => donation.status === 'Completed'), [donations]);
  const totalRaised = useMemo(() => completed.reduce((sum, donation) => sum + donation.amount, 0), [completed]);
  return { donations, completed, totalRaised, addDonation };
}
