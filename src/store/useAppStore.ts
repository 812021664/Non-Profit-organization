import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_SETTINGS,
  MOCK_ACTIVITIES,
  MOCK_CAMPAIGNS,
  MOCK_COMMUNICATIONS,
  MOCK_DONATIONS,
  MOCK_DONORS,
} from '@/data/mockData';
import { uid } from '@/lib/utils';
import type {
  Activity,
  Campaign,
  Donation,
  Donor,
  OrganizationSettings,
  SentCommunication,
} from '@/types';

export type NewDonation = Pick<Donation, 'donorId' | 'campaignId' | 'amount' | 'date' | 'status' | 'paymentMethod' | 'channel' | 'recurring' | 'note'>;
export type NewDonor = Pick<Donor, 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'country' | 'kind' | 'communicationConsent' | 'tags'> & { notes?: string };
export type NewCampaign = Pick<Campaign, 'name' | 'category' | 'description' | 'goal' | 'startDate' | 'endDate' | 'status' | 'accent'>;

interface AppState {
  donors: Donor[];
  donations: Donation[];
  campaigns: Campaign[];
  activities: Activity[];
  communications: SentCommunication[];
  settings: OrganizationSettings;
  addDonor: (donor: NewDonor) => Donor;
  updateDonor: (id: string, updates: Partial<Donor>) => void;
  addDonation: (donation: NewDonation) => Donation;
  addCampaign: (campaign: NewCampaign) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  sendCommunication: (message: Omit<SentCommunication, 'id' | 'sentAt'>) => void;
  updateSettings: (settings: Partial<OrganizationSettings>) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  replaceData: (data: Pick<AppState, 'donors' | 'donations' | 'campaigns'>) => void;
  resetDemo: () => void;
}

const clone = <T,>(value: T): T => structuredClone(value);

const initialState = {
  donors: clone(MOCK_DONORS),
  donations: clone(MOCK_DONATIONS),
  campaigns: clone(MOCK_CAMPAIGNS),
  activities: clone(MOCK_ACTIVITIES),
  communications: clone(MOCK_COMMUNICATIONS),
  settings: clone(DEFAULT_SETTINGS),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addDonor: (input) => {
        const now = new Date().toISOString();
        const donor: Donor = {
          ...input,
          id: uid('donor'),
          tier: 'Supporter',
          status: 'New',
          totalGiven: 0,
          donationCount: 0,
          firstGiftDate: now,
          lastGiftDate: now,
          joinedAt: now,
        };
        set((state) => ({
          donors: [donor, ...state.donors],
          activities: [{
            id: uid('activity'),
            type: 'donor',
            title: 'New donor added',
            description: `${donor.firstName} ${donor.lastName} joined your organization`,
            timestamp: now,
          }, ...state.activities],
        }));
        return donor;
      },
      updateDonor: (id, updates) => set((state) => ({
        donors: state.donors.map((donor) => donor.id === id ? { ...donor, ...updates } : donor),
      })),
      addDonation: (input) => {
        const now = new Date().toISOString();
        const donation: Donation = {
          ...input,
          id: uid('donation'),
          reference: `KG-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 89999))}`,
        };
        set((state) => {
          const donorDonations = state.donations.filter((item) => item.donorId === donation.donorId && item.status === 'Completed');
          const newTotal = donorDonations.reduce((total, item) => total + item.amount, 0) + (donation.status === 'Completed' ? donation.amount : 0);
          const count = donorDonations.length + (donation.status === 'Completed' ? 1 : 0);
          const tier = newTotal >= 65_000 ? 'Visionary' : newTotal >= 25_000 ? 'Champion' : newTotal >= 8_000 ? 'Sustainer' : 'Supporter';
          const donor = state.donors.find((item) => item.id === donation.donorId);
          return {
            donations: [donation, ...state.donations],
            donors: state.donors.map((item) => item.id === donation.donorId ? {
              ...item,
              totalGiven: newTotal,
              donationCount: count,
              tier,
              status: 'Active',
              lastGiftDate: donation.status === 'Completed' ? donation.date : item.lastGiftDate,
            } : item),
            campaigns: state.campaigns.map((campaign) => campaign.id === donation.campaignId ? {
              ...campaign,
              raised: campaign.raised + (donation.status === 'Completed' ? donation.amount : 0),
              donorCount: campaign.donorCount + (donation.status === 'Completed' ? 1 : 0),
            } : campaign),
            activities: donation.status === 'Completed' ? [{
              id: uid('activity'),
              type: 'donation',
              title: `New ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(donation.amount)} gift received`,
              description: `${donor?.firstName ?? 'Anonymous'} ${donor?.lastName ?? 'donor'}`,
              timestamp: now,
            }, ...state.activities] : state.activities,
          };
        });
        return donation;
      },
      addCampaign: (input) => {
        const campaign: Campaign = { ...input, id: uid('campaign'), raised: 0, donorCount: 0 };
        set((state) => ({ campaigns: [campaign, ...state.campaigns] }));
        return campaign;
      },
      updateCampaign: (id, updates) => set((state) => ({
        campaigns: state.campaigns.map((campaign) => campaign.id === id ? { ...campaign, ...updates } : campaign),
      })),
      sendCommunication: (message) => set((state) => ({
        communications: [{ ...message, id: uid('message'), sentAt: new Date().toISOString() }, ...state.communications],
        activities: [{
          id: uid('activity'),
          type: 'message',
          title: 'Email campaign sent',
          description: `${message.recipientCount} recipients · ${message.audience}`,
          timestamp: new Date().toISOString(),
        }, ...state.activities],
      })),
      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
      addActivity: (activity) => set((state) => ({
        activities: [{ ...activity, id: uid('activity'), timestamp: new Date().toISOString() }, ...state.activities],
      })),
      replaceData: (data) => set({ ...data }),
      resetDemo: () => {
        set({ ...clone(initialState) });
        get().addActivity({ type: 'system', title: 'Demo data restored', description: 'All sample records were reset' });
      },
    }),
    {
      name: 'kindred-giving-data',
      version: 1,
    },
  ),
);
