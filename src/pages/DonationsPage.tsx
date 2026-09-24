import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  HandHeart,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { completedDonations } from '@/lib/analytics';
import { cn, donorName, downloadCsv, formatCurrency, formatDate, formatDateTime, formatNumber, initials } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { Donation, DonationStatus } from '@/types';

const statusTone: Record<DonationStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  Completed: 'success',
  Pending: 'warning',
  Failed: 'danger',
  Refunded: 'info',
};

function DonationDetail({ donation, onClose }: { donation: Donation; onClose: () => void }) {
  const donors = useAppStore((state) => state.donors);
  const campaigns = useAppStore((state) => state.campaigns);
  const addToast = useUIStore((state) => state.addToast);
  const donor = donors.find((item) => item.id === donation.donorId);
  const campaign = campaigns.find((item) => item.id === donation.campaignId);
  if (!donor || !campaign) return null;

  return <Modal open onClose={onClose} title="Donation details" description={`Reference ${donation.reference}`} size="md" footer={<><Button variant="secondary" onClick={() => { addToast({ kind: 'success', title: 'Receipt downloaded', description: `A receipt for ${donorName(donor)} is ready.` }); }}><Download className="h-4 w-4" />Download receipt</Button><Button onClick={onClose}>Done</Button></>}>
    <div className="rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.075] to-transparent p-5 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><HandHeart className="h-5 w-5" /></div>
      <p className="mt-3 text-xs text-white/35">Donation amount</p>
      <p className="mt-1 font-display text-4xl text-white">{formatCurrency(donation.amount)}</p>
      <Badge tone={statusTone[donation.status]} className="mt-3" dot>{donation.status}</Badge>
    </div>
    <div className="mt-5 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] px-4">
      {[['Donor', donorName(donor)], ['Campaign', campaign.name], ['Date received', formatDateTime(donation.date)], ['Payment method', donation.paymentMethod], ['Channel', donation.channel], ['Gift type', donation.recurring ? 'Recurring' : 'One-time']].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 py-3.5 text-xs"><span className="text-white/32">{label}</span><span className="text-right font-medium text-white/70">{value}</span></div>)}
    </div>
    {donation.note && <div className="mt-4"><p className="label">Internal note</p><p className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-xs leading-5 text-white/45">{donation.note}</p></div>}
  </Modal>;
}

export default function DonationsPage() {
  const donations = useAppStore((state) => state.donations);
  const donors = useAppStore((state) => state.donors);
  const campaigns = useAppStore((state) => state.campaigns);
  const setDonationModalOpen = useUIStore((state) => state.setDonationModalOpen);
  const addToast = useUIStore((state) => state.addToast);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [campaignId, setCampaignId] = useState('All');
  const [method, setMethod] = useState('All');
  const [selected, setSelected] = useState<Donation | null>(null);

  const filtered = useMemo(() => [...donations]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .filter((donation) => {
      const donor = donors.find((item) => item.id === donation.donorId);
      const term = search.toLowerCase();
      return (!term || `${donor ? donorName(donor) : ''} ${donation.reference} ${donation.note ?? ''}`.toLowerCase().includes(term))
        && (status === 'All' || donation.status === status)
        && (campaignId === 'All' || donation.campaignId === campaignId)
        && (method === 'All' || donation.paymentMethod === method);
    }), [donations, donors, search, status, campaignId, method]);

  const completed = completedDonations(donations);
  const total = completed.reduce((sum, donation) => sum + donation.amount, 0);
  const pending = donations.filter((donation) => donation.status === 'Pending').reduce((sum, donation) => sum + donation.amount, 0);
  const refunded = donations.filter((donation) => donation.status === 'Refunded').reduce((sum, donation) => sum + donation.amount, 0);
  const average = completed.length ? total / completed.length : 0;
  const stats = [
    { label: 'Completed giving', value: formatCurrency(total, 'USD', true), detail: `${formatNumber(completed.length)} gifts`, icon: CheckCircle2, tone: 'emerald' },
    { label: 'Average gift', value: formatCurrency(average, 'USD', true), detail: 'All completed gifts', icon: CreditCard, tone: 'blue' },
    { label: 'Pending', value: formatCurrency(pending, 'USD', true), detail: 'Awaiting settlement', icon: Clock3, tone: 'gold' },
    { label: 'Refunded', value: formatCurrency(refunded, 'USD', true), detail: 'Requires reconciliation', icon: RotateCcw, tone: 'red' },
  ] as const;

  const exportDonations = () => {
    downloadCsv(`kindred-donations-${new Date().toISOString().slice(0, 10)}.csv`, filtered.map((donation) => {
      const donor = donors.find((item) => item.id === donation.donorId);
      const campaign = campaigns.find((item) => item.id === donation.campaignId);
      return { Reference: donation.reference, Date: formatDate(donation.date), Donor: donor ? donorName(donor) : 'Unknown', Email: donor?.email ?? '', Campaign: campaign?.name ?? '', Amount: donation.amount, Status: donation.status, Method: donation.paymentMethod, Channel: donation.channel, Recurring: donation.recurring ? 'Yes' : 'No' };
    }));
    addToast({ kind: 'success', title: 'Donations exported', description: `${filtered.length} records included.` });
  };

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Gift processing" title="Donations" description="Track every contribution from first click to lasting impact." actions={<><Button variant="secondary" onClick={exportDonations}><ArrowDownToLine className="h-4 w-4" />Export</Button><Button onClick={() => setDonationModalOpen(true)}><Plus className="h-4 w-4" />Record donation</Button></>} />
    <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <Card key={stat.label} className="p-4 sm:p-5"><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/28">{stat.label}</p><p className="mt-2 font-display text-3xl text-white">{stat.value}</p><p className="mt-1 text-[10px] text-white/28">{stat.detail}</p></div><span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', stat.tone === 'emerald' ? 'bg-emerald-400/10 text-emerald-300' : stat.tone === 'blue' ? 'bg-sky-400/10 text-sky-200' : stat.tone === 'gold' ? 'bg-amber-400/10 text-amber-200' : 'bg-red-400/10 text-red-200')}><stat.icon className="h-4 w-4" /></span></div></Card>)}</section>
    <Card className="overflow-visible">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search donor, reference, or note…" className="pl-9" /></div>
        <div className="grid grid-cols-3 gap-2 xl:w-[530px]"><Select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Completed</option><option>Pending</option><option>Failed</option><option>Refunded</option></Select><Select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="All">All campaigns</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</Select><Select value={method} onChange={(event) => setMethod(event.target.value)}><option>All</option><option>Card</option><option>Bank transfer</option><option>Check</option><option>Cash</option><option>Digital wallet</option></Select></div>
        {(search || status !== 'All' || campaignId !== 'All' || method !== 'All') && <button onClick={() => { setSearch(''); setStatus('All'); setCampaignId('All'); setMethod('All'); }} className="text-xs text-white/35 hover:text-white">Clear filters</button>}
      </div>
      <div className="overflow-x-auto"><table className="data-table min-w-[950px]"><thead><tr><th>Donation</th><th>Donor</th><th>Campaign</th><th>Date</th><th>Method</th><th>Status</th><th className="text-right">Amount</th><th /></tr></thead><tbody>{filtered.slice(0, 40).map((donation) => {
        const donor = donors.find((item) => item.id === donation.donorId);
        const campaign = campaigns.find((item) => item.id === donation.campaignId);
        return <tr key={donation.id} onClick={() => setSelected(donation)} className="cursor-pointer"><td><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white/35"><Receipt className="h-3.5 w-3.5" /></span><div><p className="font-mono text-[11px] text-white/55">{donation.reference}</p><p className="mt-0.5 text-[9px] text-white/25">{donation.recurring ? 'Recurring' : 'One-time'}</p></div></div></td><td>{donor ? <div className="flex items-center gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-[9px] font-bold text-emerald-300">{initials(donor.firstName, donor.lastName)}</span><span className="text-xs text-white/60">{donorName(donor)}</span></div> : <span className="text-xs text-white/25">Unknown</span>}</td><td><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: campaign?.accent }} /><span className="max-w-[145px] truncate text-xs text-white/45">{campaign?.name}</span></div></td><td className="whitespace-nowrap text-xs text-white/38">{formatDate(donation.date)}</td><td className="text-xs text-white/45">{donation.paymentMethod}</td><td><Badge tone={statusTone[donation.status]} dot>{donation.status}</Badge></td><td className={cn('text-right text-xs font-semibold', donation.status === 'Failed' ? 'text-red-300/60 line-through' : donation.status === 'Refunded' ? 'text-white/35 line-through' : 'text-white/80')}>{formatCurrency(donation.amount)}</td><td><ArrowRight className="h-3.5 w-3.5 text-white/20" /></td></tr>;
      })}</tbody></table>{!filtered.length && <div className="py-16 text-center"><XCircle className="mx-auto h-7 w-7 text-white/15" /><p className="mt-3 text-sm text-white/40">No donations match these filters.</p></div>}</div>
      <div className="flex flex-col gap-2 border-t border-white/[0.06] px-5 py-4 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between"><span>Showing {Math.min(40, filtered.length)} of {filtered.length} matching donations</span><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" />Exports respect your current filters</div></div>
    </Card>
    {selected && <DonationDetail donation={selected} onClose={() => setSelected(null)} />}
  </div>;
}
