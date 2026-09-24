export type DonorTier = 'Visionary' | 'Champion' | 'Sustainer' | 'Supporter';
export type DonorStatus = 'Active' | 'Lapsed' | 'New';
export type DonorKind = 'Individual' | 'Corporate' | 'Foundation';

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  kind: DonorKind;
  tier: DonorTier;
  status: DonorStatus;
  totalGiven: number;
  donationCount: number;
  firstGiftDate: string;
  lastGiftDate: string;
  joinedAt: string;
  communicationConsent: boolean;
  tags: string[];
  notes?: string;
}

export type CampaignStatus = 'Active' | 'Upcoming' | 'Completed';

export interface Campaign {
  id: string;
  name: string;
  category: string;
  description: string;
  goal: number;
  raised: number;
  donorCount: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  accent: string;
}

export type DonationStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentMethod = 'Card' | 'Bank transfer' | 'Check' | 'Cash' | 'Digital wallet';
export type DonationChannel = 'Online' | 'Event' | 'Direct mail' | 'Partner' | 'Recurring';

export interface Donation {
  id: string;
  donorId: string;
  campaignId: string;
  amount: number;
  date: string;
  status: DonationStatus;
  paymentMethod: PaymentMethod;
  channel: DonationChannel;
  recurring: boolean;
  reference: string;
  note?: string;
}

export type ActivityType = 'donation' | 'donor' | 'campaign' | 'message' | 'system';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  eyebrow: string;
  body: string;
  accent: string;
}

export interface SentCommunication {
  id: string;
  templateId: string;
  subject: string;
  audience: string;
  recipientCount: number;
  sentAt: string;
  status: 'Sent' | 'Scheduled';
}

export interface OrganizationSettings {
  organizationName: string;
  mission: string;
  contactEmail: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  timezone: string;
  fiscalYearStart: string;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  donorThreshold: number;
}

export interface AppUser {
  name: string;
  email: string;
  role: 'Administrator' | 'Fundraiser' | 'Finance';
}
