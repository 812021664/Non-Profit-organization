import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  HandHeart,
  Plus,
  ReceiptText,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { completedDonations, periodStats, retentionRate } from '@/lib/analytics';
import { cn, donorName, formatCurrency, formatNumber, formatRelativeDate, initials, monthlyTotals, percent, trend } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { DonorTier } from '@/types';

const tierColors: Record<DonorTier, string> = {
  Visionary: '#4adea4',
  Champion: '#6ca8f7',
  Sustainer: '#f2b84b',
  Supporter: '#64736f',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const donors = useAppStore((state) => state.donors);
  const donations = useAppStore((state) => state.donations);
  const campaigns = useAppStore((state) => state.campaigns);
  const activities = useAppStore((state) => state.activities);
  const setDonationModalOpen = useUIStore((state) => state.setDonationModalOpen);
  const addToast = useUIStore((state) => state.addToast);
  const stats = useMemo(() => periodStats(donations, 30), [donations]);
  const monthly = useMemo(() => monthlyTotals(donations, 12), [donations]);
  const completed = useMemo(() => completedDonations(donations), [donations]);
  const recentDonations = useMemo(() => [...completed].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 5), [completed]);
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'Active');
  const activeDonors = donors.filter((donor) => donor.status === 'Active').length;
  const averageGift = stats.count ? stats.amount / stats.count : 0;
  const previousAverage = stats.previous.length ? stats.previousAmount / stats.previous.length : 0;
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const tierData = (Object.keys(tierColors) as DonorTier[]).map((tier) => ({
    name: tier,
    value: donors.filter((donor) => donor.tier === tier).length,
    color: tierColors[tier],
  })).filter((item) => item.value > 0);

  const firstName = 'Alex';
  const kpis = [
    { label: 'Raised this month', value: formatCurrency(stats.amount, 'USD', true), trend: trend(stats.amount, stats.previousAmount), detail: `${formatNumber(stats.count)} completed gifts`, icon: WalletCards, color: 'emerald' },
    { label: 'Average gift', value: formatCurrency(averageGift, 'USD', true), trend: trend(averageGift, previousAverage), detail: 'vs. previous 30 days', icon: HandHeart, color: 'blue' },
    { label: 'Active donors', value: formatNumber(activeDonors), trend: 6.4, detail: `${donors.filter((d) => d.status === 'New').length} new this period`, icon: UserRoundCheck, color: 'gold' },
    { label: 'Donor retention', value: `${retentionRate(completed).toFixed(1)}%`, trend: 2.1, detail: '90-day retention', icon: TrendingUp, color: 'purple' },
  ] as const;

  const exportSnapshot = () => {
    addToast({ kind: 'success', title: 'Dashboard snapshot ready', description: 'Your CSV export has been downloaded.' });
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Thursday · Giving command center"
        title={<>Good morning, {firstName}. <span className="font-display italic text-emerald-350/90">Let’s grow impact.</span></>}
        description="A clear view of your organization’s momentum, relationships, and next best opportunities."
        actions={<><Button variant="secondary" onClick={exportSnapshot}><Download className="h-4 w-4" />Export</Button><Button onClick={() => setDonationModalOpen(true)}><Plus className="h-4 w-4" />Record donation</Button></>}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key performance indicators">
        {kpis.map((kpi) => {
          const positive = kpi.trend >= 0;
          return (
            <Card key={kpi.label} className="group overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.13]">
              <div className="flex items-start justify-between">
                <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', kpi.color === 'emerald' ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300' : kpi.color === 'blue' ? 'border-sky-400/15 bg-sky-400/10 text-sky-300' : kpi.color === 'gold' ? 'border-amber-400/15 bg-amber-400/10 text-amber-200' : 'border-violet-400/15 bg-violet-400/10 text-violet-200')}><kpi.icon className="h-4 w-4" /></span>
                <span className={cn('flex items-center gap-1 text-[11px] font-semibold', positive ? 'text-emerald-300' : 'text-red-300')}>{positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{Math.abs(kpi.trend).toFixed(1)}%</span>
              </div>
              <p className="mt-5 font-display text-[34px] leading-none tracking-tight text-white">{kpi.value}</p>
              <p className="mt-2 text-xs font-medium text-white/55">{kpi.label}</p>
              <p className="mt-1 text-[10px] text-white/27">{kpi.detail}</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.75fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <div><div className="flex items-center gap-2"><CardTitle>Fundraising momentum</CardTitle><Badge tone="success" dot>Live</Badge></div><p className="mt-1 text-xs text-white/35">Completed gifts over the last 12 months</p></div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>View report <ArrowRight className="h-3.5 w-3.5" /></Button>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="mb-5 flex items-end gap-3"><p className="font-display text-3xl text-white">{formatCurrency(monthly.reduce((sum, month) => sum + month.amount, 0), 'USD', true)}</p><p className="mb-1 text-xs text-white/32">total raised</p></div>
            <div className="h-[245px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="givingGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4adea4" stopOpacity={0.34} /><stop offset="95%" stopColor="#4adea4" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.055)" strokeDasharray="3 6" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} interval={1} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                  <Tooltip cursor={{ stroke: 'rgba(74,222,164,.25)', strokeWidth: 1 }} contentStyle={{ background: '#12191a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 12, boxShadow: '0 15px 35px rgba(0,0,0,.35)' }} formatter={(value) => [formatCurrency(Number(value)), 'Raised']} labelStyle={{ color: 'rgba(255,255,255,.45)', marginBottom: 6 }} />
                  <Area isAnimationActive={false} type="monotone" dataKey="amount" stroke="#4adea4" strokeWidth={2.2} fill="url(#givingGradient)" activeDot={{ r: 5, fill: '#4adea4', stroke: '#0c1412', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Campaign progress</CardTitle><p className="mt-1 text-xs text-white/35">Active fundraising goals</p></div><Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')} aria-label="View campaigns"><ArrowRight className="h-4 w-4" /></Button></CardHeader>
          <CardContent className="space-y-5">
            {activeCampaigns.map((campaign) => {
              const progress = percent(campaign.raised, campaign.goal);
              return <div key={campaign.id}>
                <div className="mb-2 flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-white/75">{campaign.name}</p><p className="mt-0.5 text-[10px] text-white/30">{campaign.donorCount} donors</p></div><span className="text-xs font-semibold text-white/70">{progress.toFixed(0)}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: campaign.accent, boxShadow: `0 0 12px ${campaign.accent}45` }} /></div>
                <div className="mt-2 flex justify-between text-[10px] text-white/28"><span>{formatCurrency(campaign.raised, 'USD', true)} raised</span><span>{formatCurrency(campaign.goal, 'USD', true)} goal</span></div>
              </div>;
            })}
            <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.045] p-3.5"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><Sparkles className="h-3.5 w-3.5" />Portfolio momentum</div><p className="mt-1.5 text-[11px] leading-5 text-white/38">{formatCurrency(totalRaised, 'USD', true)} raised across {campaigns.length} campaigns—{percent(totalRaised, totalGoal).toFixed(0)}% of combined goals.</p></div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.65fr)]">
        <Card className="min-w-0">
          <CardHeader><div><CardTitle>Recent gifts</CardTitle><p className="mt-1 text-xs text-white/35">Latest completed donations across your mission</p></div><Button variant="secondary" size="sm" onClick={() => navigate('/donations')}>View all <ArrowRight className="h-3.5 w-3.5" /></Button></CardHeader>
          <div className="overflow-x-auto px-2 pb-2 sm:px-3">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead><tr className="border-b border-white/[0.06] text-[9px] uppercase tracking-[0.16em] text-white/28"><th className="px-3 py-3 font-semibold">Donor</th><th className="px-3 py-3 font-semibold">Campaign</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 text-right font-semibold">Amount</th></tr></thead>
              <tbody>{recentDonations.map((donation) => {
                const donor = donors.find((item) => item.id === donation.donorId);
                const campaign = campaigns.find((item) => item.id === donation.campaignId);
                if (!donor || !campaign) return null;
                return <tr key={donation.id} className="border-b border-white/[0.045] last:border-0 hover:bg-white/[0.02]"><td className="px-3 py-3.5"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.055] text-[10px] font-bold text-white/55">{initials(donor.firstName, donor.lastName)}</span><div><p className="text-xs font-medium text-white/75">{donorName(donor)}</p><p className="text-[10px] text-white/28">{donation.channel}</p></div></div></td><td className="px-3 py-3.5 text-xs text-white/45"><span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: campaign.accent }} />{campaign.name}</span></td><td className="px-3 py-3.5 text-xs text-white/35">{formatRelativeDate(donation.date)}</td><td className="px-3 py-3.5 text-right text-xs font-semibold text-white/80">{formatCurrency(donation.amount)}</td></tr>;
              })}</tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Donor community</CardTitle><p className="mt-1 text-xs text-white/35">Relationship tiers</p></div><UsersRound className="h-4 w-4 text-white/30" /></CardHeader>
          <CardContent>
            <div className="relative mx-auto h-[160px] max-w-[240px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie isAnimationActive={false} data={tierData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={3} stroke="none">{tierData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={{ background: '#12191a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10 }} formatter={(value) => [value, 'Donors']} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-3xl text-white">{donors.length}</span><span className="text-[9px] uppercase tracking-widest text-white/30">donors</span></div></div>
            <div className="mt-1 grid grid-cols-2 gap-x-5 gap-y-2">{tierData.map((item) => <div key={item.name} className="flex items-center gap-2 text-[10px] text-white/40"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /><span className="flex-1">{item.name}</span><span className="font-semibold text-white/65">{item.value}</span></div>)}</div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card><CardHeader><div><CardTitle>Recent activity</CardTitle><p className="mt-1 text-xs text-white/35">A live trail of your organization</p></div><CalendarDays className="h-4 w-4 text-white/30" /></CardHeader><CardContent className="space-y-1">{activities.slice(0, 4).map((activity, index) => <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">{index < 3 && <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-white/[0.07]" />}<span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#151d1d] text-emerald-300/70">{activity.type === 'donation' ? <ReceiptText className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}</span><div className="min-w-0 pt-0.5"><p className="text-xs font-medium text-white/70">{activity.title}</p><p className="mt-0.5 truncate text-[11px] text-white/32">{activity.description}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-white/22">{formatRelativeDate(activity.timestamp)}</p></div></div>)}</CardContent></Card>
        <Card className="relative"><div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/[0.07] blur-3xl" /><CardHeader><div><Badge tone="success"><Sparkles className="h-3 w-3" /> Giving insight</Badge><CardTitle className="mt-3 text-lg">Your strongest opportunity</CardTitle></div></CardHeader><CardContent><p className="max-w-lg text-sm leading-6 text-white/45">Your <span className="font-medium text-white/70">Sustainer and Champion</span> donors have the strongest 90-day retention. A personal impact update to 12 recently engaged donors is the best next action.</p><div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => navigate('/communications')}>Create an update <ArrowRight className="h-4 w-4" /></Button><Button variant="ghost" onClick={() => navigate('/analytics')}>See the evidence</Button></div><p className="mt-4 text-[10px] text-white/24">Last recalculated today at 9:42 AM · Based on 240 donation records</p></CardContent></Card>
      </section>
    </div>
  );
}
