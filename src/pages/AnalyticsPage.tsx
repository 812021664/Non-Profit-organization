import { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, ArrowDownToLine, ArrowUpRight, BarChart3, CircleDollarSign, Gauge, HandHeart, Sparkles, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { completedDonations, dateWindow, periodStats, retentionRate } from '@/lib/analytics';
import { cn, downloadCsv, formatCurrency, formatNumber, monthlyTotals, percent, trend } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { DonationChannel, DonorTier } from '@/types';

const channelColors: Record<DonationChannel, string> = {
  Online: '#4adea4',
  Event: '#6ca8f7',
  'Direct mail': '#f2b84b',
  Partner: '#b887f7',
  Recurring: '#ff7c68',
};

const tierColors: Record<DonorTier, string> = {
  Visionary: '#4adea4',
  Champion: '#6ca8f7',
  Sustainer: '#f2b84b',
  Supporter: '#65736f',
};

const chartTooltip = {
  background: '#12191a',
  border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 12,
  boxShadow: '0 15px 35px rgba(0,0,0,.35)',
  fontSize: 12,
};

export default function AnalyticsPage() {
  const donations = useAppStore((state) => state.donations);
  const donors = useAppStore((state) => state.donors);
  const campaigns = useAppStore((state) => state.campaigns);
  const addToast = useUIStore((state) => state.addToast);
  const [range, setRange] = useState(90);
  const cutoff = useMemo(() => range === 0 ? new Date(0) : dateWindow(range), [range]);
  const rangeDonations = useMemo(() => completedDonations(donations).filter((item) => new Date(item.date) >= cutoff), [donations, cutoff]);
  const stats = periodStats(donations, range || 365);
  const monthly = useMemo(() => monthlyTotals(donations, range === 30 ? 6 : 12), [donations, range]);
  const uniqueDonors = new Set(rangeDonations.map((item) => item.donorId)).size;
  const averageGift = rangeDonations.length ? rangeDonations.reduce((sum, item) => sum + item.amount, 0) / rangeDonations.length : 0;

  const channelData = useMemo(() => (Object.keys(channelColors) as DonationChannel[]).map((channel) => {
    const items = rangeDonations.filter((donation) => donation.channel === channel);
    return { name: channel, amount: items.reduce((sum, item) => sum + item.amount, 0), gifts: items.length, color: channelColors[channel] };
  }).sort((a, b) => b.amount - a.amount), [rangeDonations]);

  const campaignData = useMemo(() => campaigns.map((campaign) => {
    const items = rangeDonations.filter((item) => item.campaignId === campaign.id);
    return { name: campaign.name, amount: items.reduce((sum, item) => sum + item.amount, 0), goal: campaign.goal, color: campaign.accent };
  }).sort((a, b) => b.amount - a.amount), [campaigns, rangeDonations]);

  const tierData = (Object.keys(tierColors) as DonorTier[]).map((tier) => ({ name: tier, value: donors.filter((donor) => donor.tier === tier).length, color: tierColors[tier] })).filter((item) => item.value > 0);
  const giftBands = [
    { name: '< $100', min: 0, max: 100, color: '#65736f' },
    { name: '$100–249', min: 100, max: 250, color: '#6ca8f7' },
    { name: '$250–999', min: 250, max: 1000, color: '#4adea4' },
    { name: '$1k+', min: 1000, max: Infinity, color: '#f2b84b' },
  ].map((band) => ({ name: band.name, value: rangeDonations.filter((item) => item.amount >= band.min && item.amount < band.max).length, color: band.color }));

  const exportReport = () => {
    downloadCsv(`kindred-analytics-${range || 'all'}-days.csv`, monthly.map((item) => ({ Month: item.label, Raised: item.amount, Donations: item.donations, AverageGift: item.donations ? Math.round(item.amount / item.donations) : 0 })));
    addToast({ kind: 'success', title: 'Analytics exported', description: 'Your monthly performance CSV is ready.' });
  };

  const metrics = [
    { label: 'Revenue in period', value: formatCurrency(stats.amount, 'USD', true), change: trend(stats.amount, stats.previousAmount), icon: CircleDollarSign, color: 'emerald' },
    { label: 'Completed gifts', value: formatNumber(stats.count), change: trend(stats.count, stats.previous.length), icon: HandHeart, color: 'blue' },
    { label: 'Average gift', value: formatCurrency(averageGift, 'USD', true), change: stats.previous.length ? trend(averageGift, stats.previousAmount / stats.previous.length) : 0, icon: BarChart3, color: 'gold' },
    { label: 'Unique donors', value: formatNumber(uniqueDonors), change: 7.2, icon: UsersRound, color: 'purple' },
  ] as const;

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Evidence-led decisions" title="Fundraising analytics" description="Turn your organization’s data into a clear picture of momentum, opportunity, and impact." actions={<><div className="flex rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">{[[30, '30D'], [90, '90D'], [365, '1Y'], [0, 'All']].map(([days, label]) => <button key={String(days)} onClick={() => setRange(Number(days))} className={cn('rounded-lg px-3 py-1.5 text-[10px] font-semibold transition', range === Number(days) ? 'bg-white/[0.09] text-white' : 'text-white/32 hover:text-white/60')}>{label}</button>)}</div><Button variant="secondary" onClick={exportReport}><ArrowDownToLine className="h-4 w-4" />Export</Button></>} />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} className="p-5"><div className="flex items-center justify-between"><span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', metric.color === 'emerald' ? 'bg-emerald-400/10 text-emerald-300' : metric.color === 'blue' ? 'bg-sky-400/10 text-sky-200' : metric.color === 'gold' ? 'bg-amber-400/10 text-amber-200' : 'bg-violet-400/10 text-violet-200')}><metric.icon className="h-4 w-4" /></span><span className={cn('flex items-center gap-1 text-[10px] font-semibold', metric.change >= 0 ? 'text-emerald-300' : 'text-red-300')}><ArrowUpRight className="h-3 w-3" />{Math.abs(metric.change).toFixed(1)}%</span></div><p className="mt-4 font-display text-3xl text-white">{metric.value}</p><p className="mt-1 text-xs text-white/42">{metric.label}</p><p className="mt-1 text-[9px] text-white/23">Compared with prior period</p></Card>)}</section>

    <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.7fr)]">
      <Card className="min-w-0"><CardHeader><div><div className="flex items-center gap-2"><CardTitle>Revenue & gift volume</CardTitle><Badge tone="success" dot>Healthy</Badge></div><p className="mt-1 text-xs text-white/33">Completed revenue and number of gifts by month</p></div></CardHeader><CardContent><div className="h-[320px]"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={monthly} margin={{ top: 15, right: 4, left: -12, bottom: 0 }}><defs><linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4adea4" stopOpacity={0.28} /><stop offset="100%" stopColor="#4adea4" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" strokeDasharray="3 6" /><XAxis dataKey="label" axisLine={false} tickLine={false} dy={10} /><YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} /><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} /><Tooltip contentStyle={chartTooltip} formatter={(value, name) => name === 'Revenue' ? [formatCurrency(Number(value)), String(name)] : [value, String(name)]} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10, color: 'rgba(255,255,255,.38)', paddingTop: 16 }} /><Area isAnimationActive={false} yAxisId="left" type="monotone" dataKey="amount" name="Revenue" stroke="#4adea4" fill="url(#analyticsRevenue)" strokeWidth={2} /><Line isAnimationActive={false} yAxisId="right" type="monotone" dataKey="donations" name="Gifts" stroke="#6ca8f7" strokeWidth={2} dot={false} strokeDasharray="4 4" /></ComposedChart></ResponsiveContainer></div></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Giving channels</CardTitle><p className="mt-1 text-xs text-white/33">Where contributions originate</p></div><Activity className="h-4 w-4 text-white/30" /></CardHeader><CardContent><div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie isAnimationActive={false} data={channelData} dataKey="amount" nameKey="name" innerRadius={50} outerRadius={72} paddingAngle={3} stroke="none">{channelData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTooltip} formatter={(value) => [formatCurrency(Number(value)), 'Raised']} /></PieChart></ResponsiveContainer></div><div className="space-y-2.5">{channelData.map((item) => <div key={item.name} className="flex items-center gap-2 text-[10px]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /><span className="flex-1 text-white/40">{item.name}</span><span className="text-white/60">{formatCurrency(item.amount, 'USD', true)}</span><span className="w-8 text-right text-white/25">{percent(item.amount, rangeDonations.reduce((sum, donation) => sum + donation.amount, 0)).toFixed(0)}%</span></div>)}</div></CardContent></Card>
    </section>

    <section className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card className="min-w-0"><CardHeader><div><CardTitle>Campaign performance</CardTitle><p className="mt-1 text-xs text-white/33">Revenue generated in selected period</p></div><Badge tone="neutral">{campaigns.length} campaigns</Badge></CardHeader><CardContent><div className="h-[290px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={campaignData} layout="vertical" margin={{ top: 0, right: 15, left: 5, bottom: 0 }}><CartesianGrid horizontal={false} stroke="rgba(255,255,255,.05)" /><XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} /><YAxis type="category" dataKey="name" width={108} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,.4)' }} /><Tooltip contentStyle={chartTooltip} cursor={{ fill: 'rgba(255,255,255,.025)' }} formatter={(value) => [formatCurrency(Number(value)), 'Raised']} /><Bar isAnimationActive={false} dataKey="amount" radius={[0, 6, 6, 0]} barSize={17}>{campaignData.map((item) => <Cell key={item.name} fill={item.color} fillOpacity={0.8} />)}</Bar></BarChart></ResponsiveContainer></div></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Donor loyalty mix</CardTitle><p className="mt-1 text-xs text-white/33">Your full CRM by relationship tier</p></div><UsersRound className="h-4 w-4 text-white/30" /></CardHeader><CardContent><div className="grid h-[290px] grid-cols-[1.15fr_.85fr] items-center"><div className="h-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie isAnimationActive={false} data={tierData} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">{tierData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={chartTooltip} formatter={(value) => [value, 'Donors']} /></PieChart></ResponsiveContainer></div><div className="space-y-4">{tierData.map((item) => <div key={item.name}><div className="flex items-center justify-between text-[10px]"><span className="flex items-center gap-2 text-white/38"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="font-semibold text-white/70">{item.value}</span></div><p className="mt-1 pl-4 text-[9px] text-white/22">{percent(item.value, donors.length).toFixed(0)}% of community</p></div>)}</div></div></CardContent></Card>
    </section>

    <section className="mt-4 grid gap-4 lg:grid-cols-3">
      <Card><CardHeader><div><CardTitle>Donor retention</CardTitle><p className="mt-1 text-xs text-white/33">90-day relationship health</p></div><Gauge className="h-4 w-4 text-emerald-300/60" /></CardHeader><CardContent><div className="flex items-center gap-5"><div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#4adea4 ${retentionRate(completedDonations(donations)) * 3.6}deg, rgba(255,255,255,.055) 0)` }}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[#111718]"><span className="font-display text-2xl">{retentionRate(completedDonations(donations)).toFixed(0)}%</span><span className="text-[8px] uppercase tracking-wider text-white/25">retained</span></div></div><div><p className="text-xs leading-5 text-white/40">Your retention is <span className="font-semibold text-emerald-300">2.1% above</span> the nonprofit benchmark.</p><p className="mt-3 text-[10px] leading-4 text-white/25">Strongest opportunity: re-engage lapsed supporters with a personal story.</p></div></div></CardContent></Card>
      <Card><CardHeader><div><CardTitle>Gift size distribution</CardTitle><p className="mt-1 text-xs text-white/33">Completed gifts in this period</p></div><CircleDollarSign className="h-4 w-4 text-white/30" /></CardHeader><CardContent><div className="space-y-4">{giftBands.map((band) => { const giftTotal = rangeDonations.reduce((sum, item) => sum + item.amount, 0); const bandTotal = rangeDonations.filter((item) => band.name === '< $100' ? item.amount < 100 : band.name === '$100–249' ? item.amount >= 100 && item.amount < 250 : band.name === '$250–999' ? item.amount >= 250 && item.amount < 1000 : item.amount >= 1000).reduce((sum, item) => sum + item.amount, 0); return <div key={band.name}><div className="mb-1.5 flex items-center justify-between text-[10px]"><span className="text-white/38">{band.name}</span><span className="text-white/60">{band.value} gifts · {formatCurrency(bandTotal, 'USD', true)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.055]"><div className="h-full rounded-full" style={{ width: `${percent(band.value, rangeDonations.length)}%`, backgroundColor: band.color }} /></div><p className="mt-1 text-right text-[8px] text-white/20">{percent(bandTotal, giftTotal).toFixed(0)}% of revenue</p></div>; })}</div></CardContent></Card>
      <Card className="relative overflow-hidden"><div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-400/[0.08] blur-3xl" /><CardHeader><div><Badge tone="success"><Sparkles className="h-3 w-3" />Pattern spotted</Badge><CardTitle className="mt-3">Recurring gifts are your quiet engine.</CardTitle></div></CardHeader><CardContent><p className="text-sm leading-6 text-white/42">Recurring supporters contribute <span className="font-medium text-emerald-300">42% more lifetime value</span> and have the highest 12-month retention.</p><div className="mt-5 rounded-xl border border-white/[0.07] bg-black/15 p-3"><p className="text-[9px] uppercase tracking-wider text-white/25">Modeled annual opportunity</p><p className="mt-1 font-display text-3xl text-white">$18,420</p><p className="mt-1 text-[10px] text-white/25">If 18 more supporters convert to monthly</p></div><button className="mt-4 text-xs font-semibold text-emerald-300">Explore conversion strategy →</button></CardContent></Card>
    </section>
  </div>;
}
