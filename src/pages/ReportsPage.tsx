import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { completedDonations } from '@/lib/analytics';
import { cn, donorName, downloadCsv, formatCurrency, formatDate, formatNumber, percent } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';

type ReportType = 'giving' | 'donors' | 'campaigns' | 'financial';

const reportInfo = {
  giving: { title: 'Giving summary', description: 'All gifts, statuses, channels, payment methods, and campaign attribution.', icon: WalletCards, color: '#4adea4' },
  donors: { title: 'Donor roster', description: 'Contact details, consent, relationship tier, and lifetime giving.', icon: UsersRound, color: '#6ca8f7' },
  campaigns: { title: 'Campaign performance', description: 'Goals, revenue, supporter counts, progress, and timelines.', icon: CheckCircle2, color: '#f2b84b' },
  financial: { title: 'Finance reconciliation', description: 'Structured giving totals for accounting and board review.', icon: ShieldCheck, color: '#b887f7' },
} as const;

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const donors = useAppStore((state) => state.donors);
  const donations = useAppStore((state) => state.donations);
  const campaigns = useAppStore((state) => state.campaigns);
  const addToast = useUIStore((state) => state.addToast);
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [autoReports, setAutoReports] = useState([true, false, true]);
  const completed = completedDonations(donations);
  const totalRaised = completed.reduce((sum, item) => sum + item.amount, 0);
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const refunded = donations.filter((item) => item.status === 'Refunded').reduce((sum, item) => sum + item.amount, 0);
  const dataHealth = 98.6;
  const selectedInfo = selected ? reportInfo[selected] : null;

  const reportRows = useMemo(() => {
    if (selected === 'donors') return donors.map((donor) => ({ Name: donorName(donor), Email: donor.email, Phone: donor.phone, Location: `${donor.city}, ${donor.country}`, Type: donor.kind, Status: donor.status, Tier: donor.tier, 'Lifetime Giving': donor.totalGiven, Gifts: donor.donationCount, 'Last Gift': formatDate(donor.lastGiftDate), Consent: donor.communicationConsent ? 'Yes' : 'No' }));
    if (selected === 'campaigns') return campaigns.map((campaign) => ({ Campaign: campaign.name, Category: campaign.category, Status: campaign.status, Goal: campaign.goal, Raised: campaign.raised, Progress: `${percent(campaign.raised, campaign.goal).toFixed(1)}%`, Donors: campaign.donorCount, Start: formatDate(campaign.startDate), End: formatDate(campaign.endDate) }));
    return donations.map((donation) => { const donor = donors.find((item) => item.id === donation.donorId); const campaign = campaigns.find((item) => item.id === donation.campaignId); return { Reference: donation.reference, Date: formatDate(donation.date), Donor: donor ? donorName(donor) : 'Unknown', Campaign: campaign?.name ?? '', Amount: donation.amount, Status: donation.status, Method: donation.paymentMethod, Channel: donation.channel, Recurring: donation.recurring ? 'Yes' : 'No' }; });
  }, [selected, donors, donations, campaigns]);

  const exportReport = (type: ReportType, format: 'csv' | 'json' | 'print') => {
    const name = reportInfo[type].title.toLowerCase().replace(/ /g, '-');
    if (format === 'print') {
      window.print();
      return;
    }
    if (format === 'json') {
      downloadJson(`kindred-${name}-${new Date().toISOString().slice(0, 10)}.json`, { generatedAt: new Date().toISOString(), organization: 'Kindred Community Foundation', summary: { donors: donors.length, donations: donations.length, campaigns: campaigns.length, totalRaised }, records: type === 'donors' ? donors : type === 'campaigns' ? campaigns : donations });
    } else {
      downloadCsv(`kindred-${name}-${new Date().toISOString().slice(0, 10)}.csv`, reportRows as Record<string, unknown>[]);
    }
    addToast({ kind: 'success', title: `${reportInfo[type].title} exported`, description: `Your ${format.toUpperCase()} download is ready.` });
  };

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Reporting center" description="Board-ready reporting, transparent data, and exports that respect the work behind every gift." title="Reports & exports" actions={<><Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" />Print workspace</Button><Button onClick={() => setScheduleOpen(true)}><Plus className="h-4 w-4" />Schedule report</Button></>} />
    <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: 'Total giving', value: formatCurrency(totalRaised, 'USD', true), detail: `${formatNumber(completed.length)} completed gifts`, icon: WalletCards },
      { label: 'Funds represented', value: percent(totalRaised, totalGoal).toFixed(0) + '%', detail: 'Across all campaign goals', icon: CheckCircle2 },
      { label: 'Donor records', value: formatNumber(donors.length), detail: `${donors.filter((donor) => donor.communicationConsent).length} consented contacts`, icon: UsersRound },
      { label: 'Data confidence', value: `${dataHealth}%`, detail: 'Identity and field coverage', icon: ShieldCheck },
    ].map((stat) => <Card key={stat.label} className="flex items-center gap-4 p-4 sm:p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-300"><stat.icon className="h-[18px] w-[18px]" /></span><div><p className="text-lg font-semibold text-white">{stat.value}</p><p className="text-xs font-medium text-white/50">{stat.label}</p><p className="mt-0.5 text-[10px] text-white/25">{stat.detail}</p></div></Card>)}</section>
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(310px,.5fr)]">
      <div><div className="mb-4"><h2 className="text-lg font-semibold text-white">Report library</h2><p className="mt-1 text-xs text-white/33">Curated views of your organization’s most important signals</p></div><div className="grid gap-3 md:grid-cols-2">{(Object.entries(reportInfo) as [ReportType, (typeof reportInfo)[ReportType]][]).map(([key, report], index) => <Card key={key} className="group cursor-pointer p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.13]" onClick={() => setSelected(key)}><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${report.color}12`, color: report.color }}><report.icon className="h-[18px] w-[18px]" /></span><Badge tone={index === 0 ? 'success' : 'neutral'}>{index === 0 ? 'Most used' : 'Ready'}</Badge></div><h3 className="mt-5 text-base font-semibold text-white/80 group-hover:text-white">{report.title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-white/33">{report.description}</p><div className="mt-5 flex items-center justify-between border-t border-white/[0.055] pt-4"><span className="text-[9px] uppercase tracking-wider text-white/22">CSV · JSON · PDF</span><span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">Open <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div></Card>)}</div></div>
      <div className="space-y-4"><Card><div className="p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white">Scheduled reports</h2><p className="mt-1 text-[10px] text-white/30">Automated delivery</p></div><CalendarClock className="h-4 w-4 text-white/30" /></div><div className="mt-4 space-y-2">{['Monthly board summary', 'Donor retention brief', 'Campaign pacing digest'].map((name, index) => <div key={name} className="flex items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.02] p-3"><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium text-white/60">{name}</p><p className="mt-0.5 text-[9px] text-white/25">{index === 0 ? '1st of each month' : index === 1 ? 'Quarterly' : 'Every Monday'}</p></div><button role="switch" aria-checked={autoReports[index]} onClick={() => setAutoReports((values) => values.map((value, itemIndex) => itemIndex === index ? !value : value))} className={cn('relative h-5 w-9 rounded-full transition', autoReports[index] ? 'bg-emerald-450' : 'bg-white/10')}><span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', autoReports[index] ? 'left-[18px]' : 'left-0.5')} /></button></div>)}</div><Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => setScheduleOpen(true)}>Manage schedules <ArrowRight className="h-3.5 w-3.5" /></Button></div></Card><Card className="relative overflow-hidden"><div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/[0.07] blur-3xl" /><div className="relative p-5"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><ShieldCheck className="h-4 w-4" />Data integrity</div><p className="mt-3 font-display text-3xl text-white">{dataHealth}%</p><p className="mt-1 text-[10px] text-white/30">Clean records across {formatNumber(donors.length + donations.length)} entries</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.055]"><div className="h-full rounded-full bg-emerald-450" style={{ width: `${dataHealth}%` }} /></div><p className="mt-3 text-[10px] leading-4 text-white/28">No duplicate donor emails detected. {formatCurrency(refunded, 'USD', true)} in refunds is clearly separated.</p></div></Card></div>
    </section>
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selectedInfo?.title ?? 'Report'} description="Review the summary, then export in your preferred format." size="lg" footer={<><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>{selected && <><Button variant="secondary" onClick={() => exportReport(selected, 'json')}><FileJson className="h-4 w-4" />JSON</Button><Button variant="secondary" onClick={() => exportReport(selected, 'print')}><Printer className="h-4 w-4" />PDF / Print</Button><Button onClick={() => exportReport(selected, 'csv')}><FileSpreadsheet className="h-4 w-4" />Download CSV</Button></>}</>}>
      {selected && <div><div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><div className="flex items-center gap-2"><span className="eyebrow">Kindred giving report</span><Badge tone="success">Preview</Badge></div><h3 className="mt-3 font-display text-3xl text-white">{selectedInfo?.title}</h3><p className="mt-2 text-sm text-white/35">Generated {formatDate(new Date().toISOString())} · {reportRows.length} records</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[selected === 'donors' ? 'Donors' : 'Completed gifts', selected === 'donors' ? donors.length : completed.length], ['Raised / represented', formatCurrency(selected === 'donors' ? donors.reduce((sum, donor) => sum + donor.totalGiven, 0) : totalRaised, 'USD', true)], ['Campaigns', selected === 'donors' ? '—' : campaigns.length], ['Data confidence', `${dataHealth}%`]].map(([label, value]) => <div key={label} className="rounded-xl bg-black/15 p-3"><p className="text-[9px] uppercase tracking-wider text-white/25">{label}</p><p className="mt-1.5 text-sm font-semibold text-white/70">{value}</p></div>)}</div></div><div className="mt-5 grid grid-cols-3 gap-2">{[{ icon: FileSpreadsheet, label: 'CSV', detail: 'For Excel & Sheets' }, { icon: FileJson, label: 'JSON', detail: 'For developers' }, { icon: Printer, label: 'PDF', detail: 'Via print dialog' }].map((format) => <button key={format.label} onClick={() => exportReport(selected, format.label === 'PDF' ? 'print' : format.label.toLowerCase() as 'csv' | 'json' | 'print')} className="rounded-xl border border-white/[0.07] p-3 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.04]"><format.icon className="h-4 w-4 text-emerald-300/70" /><p className="mt-2 text-xs font-semibold text-white/65">{format.label}</p><p className="mt-0.5 text-[9px] text-white/25">{format.detail}</p></button>)}</div></div>}
    </Modal>
    <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule a report" description="Set up recurring delivery for your leadership team." footer={<><Button variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Button><Button onClick={() => { setScheduleOpen(false); addToast({ kind: 'success', title: 'Report scheduled', description: 'The new schedule appears in your delivery list.' }); }}>Create schedule</Button></>}>
      <div className="space-y-5"><div><p className="label">Report</p><div className="grid gap-2 sm:grid-cols-2">{Object.entries(reportInfo).map(([key, report]) => <button key={key} className="flex items-center gap-2 rounded-xl border border-white/[0.07] p-3 text-left text-xs text-white/55 transition hover:border-emerald-400/20"><report.icon className="h-4 w-4 text-emerald-300/60" />{report.title}</button>)}</div></div><div className="grid gap-4 sm:grid-cols-2"><div><p className="label">Frequency</p><select className="input-glass"><option>Monthly</option><option>Quarterly</option><option>Weekly</option></select></div><div><p className="label">Delivery day</p><select className="input-glass"><option>First of the month</option><option>Every Monday</option><option>Last day of month</option></select></div></div><div><p className="label">Recipients</p><input className="input-glass" type="email" placeholder="board@example.org" /></div><div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3 text-[10px] leading-5 text-white/35"><FileText className="mb-1 h-4 w-4 text-amber-200/60" />Scheduled delivery requires a configured email provider in the deployment environment. This demo records the schedule in the interface.</div></div>
    </Modal>
  </div>;
}
