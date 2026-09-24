import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { percent } from '@/lib/utils';

export function useCampaigns() {
  const campaigns = useAppStore((state) => state.campaigns);
  const addCampaign = useAppStore((state) => state.addCampaign);
  const updateCampaign = useAppStore((state) => state.updateCampaign);
  const withProgress = useMemo(() => campaigns.map((campaign) => ({ ...campaign, progress: percent(campaign.raised, campaign.goal) })), [campaigns]);
  return { campaigns: withProgress, addCampaign, updateCampaign };
}
