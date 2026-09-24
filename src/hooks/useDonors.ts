import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function useDonors() {
  const donors = useAppStore((state) => state.donors);
  const addDonor = useAppStore((state) => state.addDonor);
  const updateDonor = useAppStore((state) => state.updateDonor);
  const donations = useAppStore((state) => state.donations);
  const enriched = useMemo(() => donors.map((donor) => ({
    ...donor,
    averageGift: donor.donationCount ? donor.totalGiven / donor.donationCount : 0,
    recentGifts: donations.filter((donation) => donation.donorId === donor.id).length,
  })), [donors, donations]);
  return { donors, enriched, addDonor, updateDonor };
}
