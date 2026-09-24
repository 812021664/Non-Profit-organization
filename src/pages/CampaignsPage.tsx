import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Goal,
  Plus,
  Target,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn, formatCurrency, formatDate, percent } from '@/lib/utils';
import { campaignService } from '@/services/campaignService';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { Campaign, CampaignStatus } from '@/types';

const campaignSchema = z.object({
  name: z.string().min(3, 'Enter a campaign name'),
  category: z.string().min(2, 'Enter a category'),
  description: z.string().min(10, 'Add a short campaign description'),
  goal: z.coerce.number().positive('Set a positive goal'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  status: z.enum(['Active', 'Upcoming', 'Completed']),
  accent: z.string(),
}).refine((value) => new Date(value.endDate) >= new Date(value.startDate), { message: 'End date must follow start date', path: ['endDate'] });

type CampaignForm = z.infer<typeof campaignSchema>;

const statusTone: Record<CampaignStatus, 'success' | 'info' | 'neutral'> = { Active: 'success', Upcoming: 'info', Completed: 'neutral' };

function CreateCampaignModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addCampaign = useAppStore((state) => state.addCampaign);
  const addToast = useUIStore((state) => state.addToast);
  const dataMode = useUIStore((state) => state.dataMode);
  const setDataMode = useUIStore((state) => state.setDataMode);
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
  const form = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { name: '', category: '', description: '', goal: 50_000, startDate: today, endDate: nextMonth, status: 'Upcoming', accent: '#23c983' },
  });

  const submit = async (values: CampaignForm) => {
    const campaign = addCampaign({ ...values, startDate: new Date(`${values.startDate}T12:00:00`).toISOString(), endDate: new Date(`${values.endDate}T12:00:00`).toISOString() });
    if (dataMode === 'connected') {
      try {
        await campaignService.save(campaign);
      } catch {
        setDataMode('offline');
        addToast({ kind: 'info', title: 'Saved locally; API sync paused', description: 'The campaign remains available in this browser.' });
      }
    }
    addToast({ kind: 'success', title: 'Campaign created', description: `${values.name} is ready for donations.` });
    form.reset();
    onClose();
  };

  return <Modal open={open} onClose={onClose} title="Create a campaign" description="Set the goal, story, and timeline for a new initiative." size="lg" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="campaign-form">Create campaign</Button></>}>
    <form id="campaign-form" onSubmit={form.handleSubmit(submit)} className="grid gap-5 sm:grid-cols-2">
      <Field label="Campaign name" error={form.formState.errors.name?.message} className="sm:col-span-2"><Input {...form.register('name')} placeholder="A brighter tomorrow" /></Field>
      <Field label="Category" error={form.formState.errors.category?.message}><Input {...form.register('category')} placeholder="Education" /></Field>
      <Field label="Fundraising goal" error={form.formState.errors.goal?.message}><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/35">$</span><Input type="number" min="1" className="pl-7" {...form.register('goal')} /></div></Field>
      <Field label="Start date" error={form.formState.errors.startDate?.message}><Input type="date" {...form.register('startDate')} /></Field>
      <Field label="End date" error={form.formState.errors.endDate?.message}><Input type="date" {...form.register('endDate')} /></Field>
      <Field label="Status"><Select {...form.register('status')}><option>Upcoming</option><option>Active</option><option>Completed</option></Select></Field>
      <Field label="Accent color"><div className="flex h-[42px] items-center gap-3 rounded-xl border border-white/[0.09] bg-black/20 px-3"><input type="color" className="h-6 w-8 cursor-pointer border-0 bg-transparent" {...form.register('accent')} /><span className="font-mono text-xs text-white/40">{form.watch('accent')}</span></div></Field>
      <Field label="Campaign story" error={form.formState.errors.description?.message} className="sm:col-span-2"><Textarea className="min-h-24" {...form.register('description')} placeholder="Describe the change this campaign will make…" /></Field>
    </form>
  </Modal>;
}

function CampaignDetail({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const donations = useAppStore((state) => state.donations).filter((item) => item.campaignId === campaign.id && item.status === 'Completed');
  const progress = percent(campaign.raised, campaign.goal);
  const remaining = Math.max(0, campaign.goal - campaign.raised);
  const days = Math.ceil((+new Date(campaign.endDate) - Date.now()) / 86_400_000);
  return <Modal open onClose={onClose} title={campaign.name} description={`${campaign.category} · ${campaign.status}`} size="lg" footer={<><Button variant="secondary" onClick={onClose}>Close</Button><Button>View giving activity <ArrowRight className="h-4 w-4" /></Button></>}>
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-6" style={{ background: `radial-gradient(circle at 85% 20%, ${campaign.accent}20, transparent 38%), rgba(255,255,255,.02)` }}>
      <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: campaign.accent }} />
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div className="max-w-lg"><Badge tone={statusTone[campaign.status]} dot>{campaign.status}</Badge><p className="mt-4 text-sm leading-6 text-white/50">{campaign.description}</p></div><div className="text-left sm:text-right"><p className="font-display text-4xl text-white">{progress.toFixed(0)}%</p><p className="text-[10px] uppercase tracking-wider text-white/30">funded</p></div></div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: campaign.accent }} /></div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[['Raised', formatCurrency(campaign.raised, 'USD', true)], ['Goal', formatCurrency(campaign.goal, 'USD', true)], ['Donors', campaign.donorCount.toString()], ['Avg. gift', formatCurrency(donations.length ? campaign.raised / donations.length : 0, 'USD', true)]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5"><p className="text-[9px] uppercase tracking-wider text-white/27">{label}</p><p className="mt-1.5 text-base font-semibold text-white/80">{value}</p></div>)}
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/[0.07] p-4"><p className="label">Campaign timeline</p><p className="text-xs text-white/65">{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</p><p className="mt-2 text-[10px] text-white/30">{days >= 0 ? `${days} days remaining` : 'Campaign concluded'}</p></div><div className="rounded-xl border border-white/[0.07] p-4"><p className="label">Still needed</p><p className="text-sm font-semibold text-white/75">{formatCurrency(remaining)}</p><p className="mt-2 text-[10px] text-white/30">{donations.length} completed gifts recorded</p></div></div>
  </Modal>;
}

export default function CampaignsPage() {
  const campaigns = useAppStore((state) => state.campaigns);
  const [filter, setFilter] = useState('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const filtered = useMemo(() => filter === 'All' ? campaigns : campaigns.filter((campaign) => campaign.status === filter), [campaigns, filter]);
  const active = campaigns.filter((campaign) => campaign.status === 'Active');
  const totalRaised = active.reduce((sum, campaign) => sum + campaign.raised, 0);
  const totalGoal = active.reduce((sum, campaign) => sum + campaign.goal, 0);
  const totalDonors = new Set(campaigns.flatMap((campaign) => [campaign.id])).size;
  const overall = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0);

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Fundraising portfolio" title="Campaigns" description="Turn your mission into focused, measurable campaigns that inspire action." actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New campaign</Button>} />
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: 'Portfolio raised', value: formatCurrency(overall, 'USD', true), detail: 'Across all campaigns', icon: TrendingUp },
      { label: 'Active campaigns', value: active.length.toString(), detail: `${formatCurrency(totalRaised, 'USD', true)} in motion`, icon: Target },
      { label: 'Combined active goal', value: formatCurrency(totalGoal, 'USD', true), detail: `${percent(totalRaised, totalGoal).toFixed(0)}% funded`, icon: Goal },
      { label: 'Campaigns', value: totalDonors.toString(), detail: '1 upcoming · 1 completed', icon: CheckCircle2 },
    ].map((stat) => <Card key={stat.label} className="flex items-center gap-4 p-4 sm:p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-300"><stat.icon className="h-[18px] w-[18px]" /></span><div><p className="text-lg font-semibold text-white">{stat.value}</p><p className="text-xs font-medium text-white/50">{stat.label}</p><p className="mt-0.5 text-[10px] text-white/25">{stat.detail}</p></div></Card>)}</section>
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">{['All', 'Active', 'Upcoming', 'Completed'].map((item) => <button key={item} onClick={() => setFilter(item)} className={cn('whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition', filter === item ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300' : 'border-white/[0.07] bg-white/[0.025] text-white/38 hover:text-white')}>{item}<span className="ml-1.5 text-[9px] opacity-50">{item === 'All' ? campaigns.length : campaigns.filter((campaign) => campaign.status === item).length}</span></button>)}</div>
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{filtered.map((campaign) => {
      const progress = percent(campaign.raised, campaign.goal);
      const days = Math.ceil((+new Date(campaign.endDate) - Date.now()) / 86_400_000);
      return <Card key={campaign.id} className="group cursor-pointer transition duration-300 hover:-translate-y-1 hover:border-white/[0.13]" onClick={() => setSelected(campaign)}>
        <div className="relative h-32 overflow-hidden border-b border-white/[0.06]" style={{ background: `radial-gradient(circle at 80% 0%, ${campaign.accent}35, transparent 45%), linear-gradient(135deg, ${campaign.accent}13, rgba(255,255,255,.015))` }}>
          <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/[0.05]" /><div className="absolute -right-2 -top-8 h-24 w-24 rounded-full border border-white/[0.06]" /><Target className="absolute bottom-5 right-6 h-8 w-8 text-white/10" strokeWidth={1.2} />
          <div className="absolute left-5 top-5"><Badge tone={statusTone[campaign.status]} dot>{campaign.status}</Badge></div>
        </div>
        <div className="p-5">
          <p className="eyebrow">{campaign.category}</p><h2 className="mt-1.5 text-lg font-semibold text-white/85 transition group-hover:text-white">{campaign.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-white/35">{campaign.description}</p>
          <div className="mt-5 flex items-end justify-between"><div><p className="font-display text-3xl text-white">{formatCurrency(campaign.raised, 'USD', true)}</p><p className="text-[10px] text-white/27">of {formatCurrency(campaign.goal, 'USD', true)} goal</p></div><span className="text-sm font-semibold text-white/60">{progress.toFixed(0)}%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: campaign.accent }} /></div>
          <div className="mt-4 flex items-center gap-4 border-t border-white/[0.055] pt-4 text-[10px] text-white/30"><span className="flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" />{campaign.donorCount} donors</span><span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{days > 0 ? `${days} days left` : formatDate(campaign.endDate, { month: 'short', day: 'numeric' })}</span><ArrowRight className="ml-auto h-3.5 w-3.5 text-white/20 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></div>
        </div>
      </Card>;
    })}</section>
    {!filtered.length && <Card className="py-16 text-center"><Clock3 className="mx-auto h-8 w-8 text-white/15" /><p className="mt-3 text-sm text-white/40">No campaigns match this status.</p></Card>}
    <CreateCampaignModal open={createOpen} onClose={() => setCreateOpen(false)} />
    {selected && <CampaignDetail campaign={selected} onClose={() => setSelected(null)} />}
  </div>;
}
