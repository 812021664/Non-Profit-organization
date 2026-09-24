import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowRight,
  Building2,
  Download,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { downloadCsv, donorName, formatCurrency, formatDate, initials } from '@/lib/utils';
import { donorService } from '@/services/donorService';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { Donor, DonorStatus, DonorTier } from '@/types';

const donorSchema = z.object({
  firstName: z.string().min(2, 'Enter a first name'),
  lastName: z.string().min(2, 'Enter a last name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a phone number'),
  city: z.string().min(2, 'Enter a city'),
  country: z.string().min(2, 'Enter a country'),
  kind: z.enum(['Individual', 'Corporate', 'Foundation']),
  communicationConsent: z.boolean(),
  tags: z.string().optional(),
  notes: z.string().max(300).optional(),
});

type DonorForm = z.infer<typeof donorSchema>;

const statusTone: Record<DonorStatus, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  Lapsed: 'warning',
  New: 'info',
};

const tierTone: Record<DonorTier, 'purple' | 'info' | 'warning' | 'neutral'> = {
  Visionary: 'purple',
  Champion: 'info',
  Sustainer: 'warning',
  Supporter: 'neutral',
};

function AddDonorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addDonor = useAppStore((state) => state.addDonor);
  const addToast = useUIStore((state) => state.addToast);
  const dataMode = useUIStore((state) => state.dataMode);
  const setDataMode = useUIStore((state) => state.setDataMode);
  const form = useForm<DonorForm>({ resolver: zodResolver(donorSchema), defaultValues: { kind: 'Individual', communicationConsent: true, country: 'USA' } });

  const submit = async (values: DonorForm) => {
    const donor = addDonor({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      city: values.city,
      country: values.country,
      kind: values.kind,
      communicationConsent: values.communicationConsent,
      tags: values.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [],
      notes: values.notes,
    });
    if (dataMode === 'connected') {
      try {
        await donorService.save(donor);
      } catch {
        setDataMode('offline');
        addToast({ kind: 'info', title: 'Saved locally; API sync paused', description: 'The donor remains available in this browser.' });
      }
    }
    addToast({ kind: 'success', title: 'Donor added', description: `${values.firstName} ${values.lastName} is now in your CRM.` });
    form.reset();
    onClose();
  };

  return <Modal open={open} onClose={onClose} title="Add a donor" description="Create a relationship record for your team." footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="donor-form">Add donor</Button></>}>
    <form id="donor-form" onSubmit={form.handleSubmit(submit)} className="grid gap-5 sm:grid-cols-2">
      <Field label="First name" error={form.formState.errors.firstName?.message}><Input {...form.register('firstName')} placeholder="Maya" /></Field>
      <Field label="Last name" error={form.formState.errors.lastName?.message}><Input {...form.register('lastName')} placeholder="Chen" /></Field>
      <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register('email')} placeholder="maya@example.org" /></Field>
      <Field label="Phone" error={form.formState.errors.phone?.message}><Input {...form.register('phone')} placeholder="+1 555 123 4567" /></Field>
      <Field label="City" error={form.formState.errors.city?.message}><Input {...form.register('city')} placeholder="San Francisco" /></Field>
      <Field label="Country" error={form.formState.errors.country?.message}><Input {...form.register('country')} /></Field>
      <Field label="Relationship type"><Select {...form.register('kind')}><option>Individual</option><option>Corporate</option><option>Foundation</option></Select></Field>
      <Field label="Tags" hint="Separate with commas"><Input {...form.register('tags')} placeholder="Newsletter, Major gift" /></Field>
      <Field label="Notes" className="sm:col-span-2"><Textarea {...form.register('notes')} placeholder="Interests, context, or next steps…" /></Field>
      <label className="flex cursor-pointer items-center gap-3 sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-emerald-400" {...form.register('communicationConsent')} /><span className="text-sm text-white/65">Donor has consented to receive updates</span></label>
    </form>
  </Modal>;
}

function DonorDetail({ donor, onClose }: { donor: Donor; onClose: () => void }) {
  const donations = useAppStore((state) => state.donations).filter((item) => item.donorId === donor.id && item.status === 'Completed').sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const campaigns = useAppStore((state) => state.campaigns);
  const setDonationModalOpen = useUIStore((state) => state.setDonationModalOpen);
  const averageGift = donor.donationCount ? donor.totalGiven / donor.donationCount : 0;

  return <Modal open onClose={onClose} title="Donor profile" description={`Relationship since ${formatDate(donor.joinedAt, { month: 'long', year: 'numeric' })}`} size="lg" footer={<><Button variant="secondary"><Mail className="h-4 w-4" />Send email</Button><Button onClick={() => { setDonationModalOpen(true); onClose(); }}>Record gift <ArrowRight className="h-4 w-4" /></Button></>}>
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-350/80 to-emerald-550 text-xl font-bold text-[#07110d] shadow-glow">{initials(donor.firstName, donor.lastName)}</div>
          <h3 className="mt-4 text-base font-semibold text-white">{donorName(donor)}</h3>
          <p className="mt-1 text-xs text-white/35">{donor.kind}</p>
          <div className="mt-3 flex justify-center gap-2"><Badge tone={statusTone[donor.status]} dot>{donor.status}</Badge><Badge tone={tierTone[donor.tier]}>{donor.tier}</Badge></div>
        </div>
        <div className="mt-3 space-y-3 rounded-2xl border border-white/[0.07] p-4 text-xs text-white/45">
          <a href={`mailto:${donor.email}`} className="flex items-center gap-2.5 hover:text-white"><Mail className="h-4 w-4 text-white/30" />{donor.email}</a>
          <p className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-white/30" />{donor.city}, {donor.country}</p>
          <p>{donor.phone}</p>
          <p>{donor.communicationConsent ? '✓ Communication consent on file' : 'Communication consent needed'}</p>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-3 gap-2">
          {[['Lifetime giving', formatCurrency(donor.totalGiven, 'USD', true)], ['Gifts', donor.donationCount.toString()], ['Avg. gift', formatCurrency(averageGift, 'USD', true)]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"><p className="text-[9px] uppercase tracking-wider text-white/25">{label}</p><p className="mt-1.5 text-sm font-semibold text-white/80">{value}</p></div>)}
        </div>
        <div className="mt-5"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-white/80">Giving history</p><p className="text-[10px] text-white/30">Most recent first</p></div><div className="max-h-72 space-y-1 overflow-y-auto pr-1">{donations.slice(0, 8).map((donation) => { const campaign = campaigns.find((item) => item.id === donation.campaignId); return <div key={donation.id} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.035]"><span className="h-8 w-1 rounded-full" style={{ backgroundColor: campaign?.accent }} /><div className="min-w-0 flex-1"><p className="truncate text-xs text-white/65">{campaign?.name}</p><p className="mt-0.5 text-[10px] text-white/28">{formatDate(donation.date)} · {donation.paymentMethod}</p></div><span className="text-xs font-semibold text-white/75">{formatCurrency(donation.amount)}</span></div>; })}</div></div>
        {donor.notes && <div className="mt-4 rounded-xl border border-amber-300/10 bg-amber-300/[0.04] p-3 text-xs leading-5 text-white/40"><span className="font-semibold text-amber-200/70">Team note:</span> {donor.notes}</div>}
      </div>
    </div>
  </Modal>;
}

export default function DonorsPage() {
  const donors = useAppStore((state) => state.donors);
  const donations = useAppStore((state) => state.donations);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [tier, setTier] = useState('All');
  const [kind, setKind] = useState('All');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Donor | null>(null);
  const addToast = useUIStore((state) => state.addToast);
  const pageSize = 8;
  const filtered = useMemo(() => donors.filter((donor) => {
    const term = search.toLowerCase();
    return (!term || `${donorName(donor)} ${donor.email} ${donor.city} ${donor.tags.join(' ')}`.toLowerCase().includes(term))
      && (status === 'All' || donor.status === status)
      && (tier === 'All' || donor.tier === tier)
      && (kind === 'All' || donor.kind === kind);
  }), [donors, search, status, tier, kind]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => { setPage(1); }, [search, status, tier, kind]);
  useEffect(() => {
    const donorId = searchParams.get('donor');
    if (donorId) {
      const donor = donors.find((item) => item.id === donorId);
      if (donor) setSelected(donor);
      searchParams.delete('donor');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, donors, setSearchParams]);

  const exportDonors = () => {
    downloadCsv(`kindred-donors-${new Date().toISOString().slice(0, 10)}.csv`, donors.map((donor) => ({ Name: donorName(donor), Email: donor.email, Phone: donor.phone, Location: `${donor.city}, ${donor.country}`, Type: donor.kind, Status: donor.status, Tier: donor.tier, 'Lifetime Giving': donor.totalGiven, Gifts: donor.donationCount, 'Last Gift': formatDate(donor.lastGiftDate) })));
    addToast({ kind: 'success', title: 'Donor export downloaded', description: `${donors.length} records included.` });
  };

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Relationship intelligence" title="Donor community" description="Know every supporter, understand their journey, and make every interaction count." actions={<><Button variant="secondary" onClick={exportDonors}><Download className="h-4 w-4" />Export</Button><Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add donor</Button></>} />
    <section className="mb-4 grid gap-3 sm:grid-cols-3">
      {[{ label: 'Total donors', value: donors.length, detail: `${donors.filter((d) => d.status === 'New').length} new relationships`, icon: UsersRound }, { label: 'Active community', value: donors.filter((d) => d.status === 'Active').length, detail: `${((donors.filter((d) => d.status === 'Active').length / donors.length) * 100).toFixed(0)}% of your CRM`, icon: UserRound }, { label: 'Lifetime giving', value: formatCurrency(donors.reduce((sum, donor) => sum + donor.totalGiven, 0), 'USD', true), detail: `${formatCurrency(donors.reduce((sum, donor) => sum + donor.totalGiven, 0) / Math.max(1, donations.filter((d) => d.status === 'Completed').length), 'USD', true)} average gift`, icon: Building2 }].map((stat) => <Card key={stat.label} className="flex items-center gap-4 p-4 sm:p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-300"><stat.icon className="h-[18px] w-[18px]" /></span><div><p className="text-lg font-semibold text-white">{stat.value}</p><p className="text-xs font-medium text-white/50">{stat.label}</p><p className="mt-0.5 hidden text-[10px] text-white/25 sm:block">{stat.detail}</p></div></Card>)}
    </section>
    <Card className="overflow-visible">
      <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/28" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, location, or tag…" className="pl-9" /></div>
        <div className="grid grid-cols-3 gap-2 lg:w-[440px]"><Select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Active</option><option>Lapsed</option><option>New</option></Select><Select value={tier} onChange={(event) => setTier(event.target.value)}><option>All</option><option>Visionary</option><option>Champion</option><option>Sustainer</option><option>Supporter</option></Select><Select value={kind} onChange={(event) => setKind(event.target.value)}><option>All</option><option>Individual</option><option>Corporate</option><option>Foundation</option></Select></div>
        {(search || status !== 'All' || tier !== 'All' || kind !== 'All') && <button onClick={() => { setSearch(''); setStatus('All'); setTier('All'); setKind('All'); }} className="inline-flex items-center gap-1 text-xs text-white/35 hover:text-white"><X className="h-3.5 w-3.5" />Clear</button>}
      </div>
      <div className="overflow-x-auto">
        <table className="data-table min-w-[930px]">
          <thead><tr><th>Donor</th><th>Status</th><th>Tier</th><th>Relationship</th><th>Last gift</th><th className="text-right">Lifetime giving</th><th aria-label="Actions" /></tr></thead>
          <tbody>{paged.map((donor) => <tr key={donor.id} onClick={() => setSelected(donor)} className="cursor-pointer"><td><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.055] text-[10px] font-bold text-white/55">{initials(donor.firstName, donor.lastName)}</span><div><p className="text-xs font-semibold text-white/80">{donorName(donor)}</p><p className="mt-0.5 text-[10px] text-white/30">{donor.email}</p></div></div></td><td><Badge tone={statusTone[donor.status]} dot>{donor.status}</Badge></td><td><Badge tone={tierTone[donor.tier]}>{donor.tier}</Badge></td><td><p className="text-xs text-white/50">{donor.donationCount} gifts</p><p className="mt-0.5 text-[10px] text-white/25">Since {formatDate(donor.joinedAt, { month: 'short', year: 'numeric' })}</p></td><td className="text-xs">{formatDate(donor.lastGiftDate)}</td><td className="text-right text-xs font-semibold text-white/80">{formatCurrency(donor.totalGiven)}</td><td><button className="rounded-lg p-2 text-white/25 hover:bg-white/[0.05] hover:text-white" aria-label={`Open ${donorName(donor)}`}><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody>
        </table>
        {!paged.length && <div className="py-16 text-center"><Search className="mx-auto h-7 w-7 text-white/15" /><p className="mt-3 text-sm text-white/40">No donors match these filters.</p></div>}
      </div>
      <div className="flex flex-col gap-3 border-t border-white/[0.06] px-5 py-4 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} donors</span><div className="flex items-center gap-2"><Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="px-2 text-[10px] text-white/30">Page {page} of {totalPages}</span><Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
    </Card>
    <AddDonorModal open={addOpen} onClose={() => setAddOpen(false)} />
    {selected && <DonorDetail donor={selected} onClose={() => setSelected(null)} />}
  </div>;
}
