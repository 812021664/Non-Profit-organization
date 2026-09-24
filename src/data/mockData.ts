import type {
  Activity,
  Campaign,
  Donation,
  Donor,
  EmailTemplate,
  OrganizationSettings,
  SentCommunication,
} from '@/types';

const day = 86_400_000;
const isoDaysAgo = (days: number) => new Date(Date.now() - days * day).toISOString();
const isoDaysFromNow = (days: number) => new Date(Date.now() + days * day).toISOString();

const donorSeeds = [
  ['Maya', 'Chen', 'maya.chen@example.org', 'San Francisco', 'USA', 'Individual'],
  ['James', 'Wilson', 'james.wilson@example.org', 'Austin', 'USA', 'Individual'],
  ['Amara', 'Okafor', 'amara.okafor@example.org', 'London', 'UK', 'Individual'],
  ['Theo', 'Martinez', 'theo.martinez@example.org', 'Denver', 'USA', 'Individual'],
  ['Sofia', 'Anders', 'sofia.anders@example.org', 'Copenhagen', 'UK', 'Individual'],
  ['Noah', 'Williams', 'noah.williams@example.org', 'Toronto', 'CA', 'Individual'],
  ['Priya', 'Shah', 'priya.shah@example.org', 'Seattle', 'USA', 'Individual'],
  ['Liam', 'Brooks', 'liam.brooks@example.org', 'Portland', 'USA', 'Individual'],
  ['Elena', 'Rossi', 'elena.rossi@example.org', 'Milan', 'Italy', 'Individual'],
  ['Malik', 'Johnson', 'malik.johnson@example.org', 'Chicago', 'USA', 'Individual'],
  ['Ava', 'Thompson', 'ava.thompson@example.org', 'Boston', 'USA', 'Individual'],
  ['Mateo', 'Silva', 'mateo.silva@example.org', 'Miami', 'USA', 'Individual'],
  ['Nora', 'Lindberg', 'nora.lindberg@example.org', 'Stockholm', 'Sweden', 'Individual'],
  ['Owen', 'Murphy', 'owen.murphy@example.org', 'Dublin', 'Ireland', 'Individual'],
  ['Zara', 'Khan', 'zara.khan@example.org', 'New York', 'USA', 'Individual'],
  ['Lucas', 'Meyer', 'lucas.meyer@example.org', 'Berlin', 'Germany', 'Individual'],
  ['Grace', 'Lee', 'grace.lee@example.org', 'Vancouver', 'CA', 'Individual'],
  ['Samir', 'Patel', 'samir.patel@example.org', 'Atlanta', 'USA', 'Individual'],
  ['Isla', 'Campbell', 'isla.campbell@example.org', 'Edinburgh', 'UK', 'Individual'],
  ['Ethan', 'Nguyen', 'ethan.nguyen@example.org', 'Houston', 'USA', 'Individual'],
  ['Layla', 'Hassan', 'layla.hassan@example.org', 'Amsterdam', 'Netherlands', 'Individual'],
  ['Diego', 'Ramirez', 'diego.ramirez@example.org', 'Los Angeles', 'USA', 'Individual'],
  ['Aisha', 'Bello', 'aisha.bello@example.org', 'Lagos', 'Nigeria', 'Individual'],
  ['Northstar', 'Foundation', 'giving@northstar.org', 'New York', 'USA', 'Foundation'],
] as const;

const amounts = [75, 125, 250, 400, 750, 1200, 2500, 5000];
const channels = ['Online', 'Event', 'Direct mail', 'Partner', 'Recurring'] as const;
const methods = ['Card', 'Bank transfer', 'Check', 'Cash', 'Digital wallet'] as const;

function buildDonations() {
  return Array.from({ length: 240 }, (_, index): Donation => {
    const donorIndex = (index * 7 + 3) % donorSeeds.length;
    const campaignIndex = index % 5;
    const baseDaysAgo = (index * 13) % 360 + (index % 5);
    const daysAgo = donorIndex >= 17 && donorIndex <= 20 && baseDaysAgo < 120 ? baseDaysAgo + 130 : baseDaysAgo;
    const statusRoll = index % 29;
    const status = statusRoll === 0
      ? 'Refunded'
      : statusRoll === 7
        ? 'Failed'
        : statusRoll === 14
          ? 'Pending'
          : 'Completed';
    return {
      id: `donation-${String(index + 1).padStart(4, '0')}`,
      donorId: `donor-${donorIndex + 1}`,
      campaignId: `campaign-${campaignIndex + 1}`,
      amount: amounts[(index * 5 + donorIndex) % amounts.length],
      date: isoDaysAgo(daysAgo),
      status,
      paymentMethod: methods[(index + donorIndex) % methods.length],
      channel: channels[(index + campaignIndex) % channels.length],
      recurring: index % 6 === 0,
      reference: `KG-${new Date(2025, 0, 1).getFullYear()}-${String(8300 + index)}`,
    };
  });
}

const donations = buildDonations();

function buildDonors(): Donor[] {
  return donorSeeds.map((seed, index) => {
    const donorDonations = donations.filter((donation) => donation.donorId === `donor-${index + 1}` && donation.status === 'Completed');
    const totalGiven = donorDonations.reduce((total, donation) => total + donation.amount, 0);
    const sortedDates = donorDonations.map((donation) => new Date(donation.date)).sort((a, b) => a.getTime() - b.getTime());
    const lastGift = sortedDates.at(-1) ?? new Date();
    const firstGift = sortedDates[0] ?? lastGift;
    return {
      id: `donor-${index + 1}`,
      firstName: seed[0],
      lastName: seed[1],
      email: seed[2],
      phone: `+1 555 ${String(120 + index).padStart(3, '0')} ${String(1100 + index * 17).slice(-4)}`,
      city: seed[3],
      country: seed[4],
      kind: seed[5],
      tier: totalGiven >= 65_000 ? 'Visionary' : totalGiven >= 25_000 ? 'Champion' : totalGiven >= 8_000 ? 'Sustainer' : 'Supporter',
      status: index >= 20 ? 'New' : index >= 16 ? 'Lapsed' : 'Active',
      totalGiven,
      donationCount: donorDonations.length,
      firstGiftDate: firstGift.toISOString(),
      lastGiftDate: lastGift.toISOString(),
      joinedAt: isoDaysAgo(360 - (index * 9) % 250),
      communicationConsent: index % 7 !== 0,
      tags: index % 3 === 0 ? ['Newsletter', 'Events'] : index % 3 === 1 ? ['Major gift'] : ['Sustainer'],
    };
  });
}

const donors = buildDonors();

function amountForCampaign(campaignIndex: number) {
  return donations
    .filter((donation) => donation.campaignId === `campaign-${campaignIndex + 1}` && donation.status === 'Completed')
    .reduce((total, donation) => total + donation.amount, 0);
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'A Home for Every Family',
    category: 'Housing',
    description: 'Safe, affordable homes and long-term support for families in need.',
    goal: 150_000,
    raised: amountForCampaign(0),
    donorCount: new Set(donations.filter((d) => d.campaignId === 'campaign-1').map((d) => d.donorId)).size,
    startDate: isoDaysAgo(190),
    endDate: isoDaysFromNow(82),
    status: 'Active',
    accent: '#23c983',
  },
  {
    id: 'campaign-2',
    name: 'Feed a Neighborhood',
    category: 'Food security',
    description: 'Fresh groceries and prepared meals delivered across five communities.',
    goal: 140_000,
    raised: amountForCampaign(1),
    donorCount: new Set(donations.filter((d) => d.campaignId === 'campaign-2').map((d) => d.donorId)).size,
    startDate: isoDaysAgo(140),
    endDate: isoDaysFromNow(34),
    status: 'Active',
    accent: '#f2b84b',
  },
  {
    id: 'campaign-3',
    name: 'Bright Futures Fund',
    category: 'Education',
    description: 'Scholarships, mentoring, and learning resources for local students.',
    goal: 160_000,
    raised: amountForCampaign(2),
    donorCount: new Set(donations.filter((d) => d.campaignId === 'campaign-3').map((d) => d.donorId)).size,
    startDate: isoDaysAgo(105),
    endDate: isoDaysFromNow(118),
    status: 'Active',
    accent: '#6ca8f7',
  },
  {
    id: 'campaign-4',
    name: 'Mobile Health Initiative',
    category: 'Health',
    description: 'Preventive care and health screenings in underserved areas.',
    goal: amountForCampaign(3),
    raised: amountForCampaign(3),
    donorCount: new Set(donations.filter((d) => d.campaignId === 'campaign-4').map((d) => d.donorId)).size,
    startDate: isoDaysAgo(340),
    endDate: isoDaysAgo(12),
    status: 'Completed',
    accent: '#b887f7',
  },
  {
    id: 'campaign-5',
    name: 'Community Resilience',
    category: 'Disaster relief',
    description: 'Rapid-response grants and recovery support when disasters strike.',
    goal: 120_000,
    raised: amountForCampaign(4),
    donorCount: new Set(donations.filter((d) => d.campaignId === 'campaign-5').map((d) => d.donorId)).size,
    startDate: isoDaysFromNow(24),
    endDate: isoDaysFromNow(190),
    status: 'Upcoming',
    accent: '#ff7c68',
  },
];

export const MOCK_DONORS = donors;
export const MOCK_DONATIONS = donations;

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'activity-1', type: 'donation', title: 'New $1,200 gift received', description: 'Maya Chen · A Home for Every Family', timestamp: isoDaysAgo(0) },
  { id: 'activity-2', type: 'donor', title: 'New donor joined', description: 'Layla Hassan joined via the website', timestamp: isoDaysAgo(1) },
  { id: 'activity-3', type: 'message', title: 'Campaign update delivered', description: '236 recipients · Monthly impact update', timestamp: isoDaysAgo(2) },
  { id: 'activity-4', type: 'campaign', title: 'Campaign reached 70%', description: 'Feed a Neighborhood is gaining momentum', timestamp: isoDaysAgo(3) },
  { id: 'activity-5', type: 'system', title: 'Bank import reconciled', description: '42 transactions matched successfully', timestamp: isoDaysAgo(4) },
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Personal impact update',
    subject: 'What your generosity made possible',
    eyebrow: 'A note of gratitude',
    body: 'Your support turned into something tangible this month. Because of donors like you, more families found safety, stability, and a place to call home. Thank you for standing beside this community.',
    accent: '#23c983',
  },
  {
    id: 'template-2',
    name: 'Campaign invitation',
    subject: 'Together, we can build something lasting',
    eyebrow: 'An invitation',
    body: 'A safe, welcoming home changes more than an address. It creates room for possibility. Join our community in making that possibility real for families who need it most.',
    accent: '#6ca8f7',
  },
  {
    id: 'template-3',
    name: 'Monthly digest',
    subject: 'The good we made possible together',
    eyebrow: 'Your monthly impact',
    body: 'Here is a look at the lives, meals, lessons, and bright futures your generosity helped move forward last month—and what comes next.',
    accent: '#f2b84b',
  },
];

export const MOCK_COMMUNICATIONS: SentCommunication[] = [
  { id: 'message-1', templateId: 'template-1', subject: 'What your generosity made possible', audience: 'Active donors', recipientCount: 218, sentAt: isoDaysAgo(2), status: 'Sent' },
  { id: 'message-2', templateId: 'template-2', subject: 'Join our spring giving circle', audience: 'Supporter tier', recipientCount: 84, sentAt: isoDaysAgo(11), status: 'Sent' },
  { id: 'message-3', templateId: 'template-3', subject: 'May impact digest', audience: 'All subscribers', recipientCount: 218, sentAt: isoDaysAgo(29), status: 'Sent' },
];

export const DEFAULT_SETTINGS: OrganizationSettings = {
  organizationName: 'Kindred Community Foundation',
  mission: 'Build lasting pathways to housing, food, education, and healthcare for every neighbor.',
  contactEmail: 'hello@kindredgiving.org',
  currency: 'USD',
  timezone: 'America/New_York',
  fiscalYearStart: 'January',
  emailNotifications: true,
  weeklyDigest: true,
  donorThreshold: 1000,
};
