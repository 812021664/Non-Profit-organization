import { useState } from 'react';
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  Cloud,
  Database,
  Download,
  KeyRound,
  Link2,
  LockKeyhole,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCog,
  UsersRound,
  Webhook,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn, donorName, formatNumber } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { OrganizationSettings } from '@/types';

const tabs = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team & access', icon: UsersRound },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'security', label: 'Security & data', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type Tab = typeof tabs[number]['id'];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-label={label} aria-checked={checked} onClick={() => onChange(!checked)} className={cn('relative h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-emerald-450' : 'bg-white/10')}><span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-all', checked ? 'left-[22px]' : 'left-0.5')} /></button>;
}

export default function SettingsPage() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const donors = useAppStore((state) => state.donors);
  const donations = useAppStore((state) => state.donations);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const addToast = useUIStore((state) => state.addToast);
  const dataMode = useUIStore((state) => state.dataMode);
  const backendStatus = useUIStore((state) => state.backendStatus);
  const syncNow = useUIStore((state) => state.syncNow);
  const [tab, setTab] = useState<Tab>('organization');
  const [form, setForm] = useState<OrganizationSettings>(settings);
  const [resetOpen, setResetOpen] = useState(false);
  const [integrations, setIntegrations] = useState({ payments: true, email: true, bank: false, webhook: false });

  const save = () => {
    updateSettings(form);
    addToast({ kind: 'success', title: 'Settings saved', description: 'Your organization preferences are up to date.' });
  };

  const updateForm = <K extends keyof OrganizationSettings>(key: K, value: OrganizationSettings[K]) => setForm((current) => ({ ...current, [key]: value }));

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Workspace control" title="Settings" description="Configure your organization, access, integrations, and data preferences." actions={<Button onClick={save}><Save className="h-4 w-4" />Save changes</Button>} />
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit p-2"><nav className="space-y-1" aria-label="Settings sections">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition', tab === item.id ? 'bg-emerald-400/[0.08] text-emerald-300' : 'text-white/38 hover:bg-white/[0.035] hover:text-white/70')}><item.icon className="h-4 w-4" />{item.label}<ChevronRight className="ml-auto h-3.5 w-3.5 opacity-30" /></button>)}</nav><div className="mt-2 border-t border-white/[0.06] p-3"><div className="flex items-center gap-2 text-[10px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-350" />Workspace healthy</div><p className="mt-1.5 text-[9px] leading-4 text-white/22">Last saved just now</p></div></Card>

      <div className="min-w-0">
        {tab === 'organization' && <div className="space-y-4"><Card><div className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><Building2 className="h-[18px] w-[18px]" /></span><div><h2 className="text-base font-semibold text-white/80">Organization profile</h2><p className="mt-0.5 text-xs text-white/30">Used across exports, receipts, and donor communications.</p></div></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Organization name"><Input value={form.organizationName} onChange={(event) => updateForm('organizationName', event.target.value)} /></Field><Field label="Primary contact"><Input type="email" value={form.contactEmail} onChange={(event) => updateForm('contactEmail', event.target.value)} /></Field><Field label="Default currency"><Select value={form.currency} onChange={(event) => updateForm('currency', event.target.value as OrganizationSettings['currency'])}><option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option></Select></Field><Field label="Timezone"><Select value={form.timezone} onChange={(event) => updateForm('timezone', event.target.value)}><option>America/New_York</option><option>America/Chicago</option><option>America/Denver</option><option>America/Los_Angeles</option><option>Europe/London</option></Select></Field><Field label="Fiscal year starts"><Select value={form.fiscalYearStart} onChange={(event) => updateForm('fiscalYearStart', event.target.value)}><option>January</option><option>April</option><option>July</option><option>October</option></Select></Field><Field label="Major donor threshold" hint="Used for recognition and follow-up"><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/30">$</span><Input type="number" className="pl-7" value={form.donorThreshold} onChange={(event) => updateForm('donorThreshold', Number(event.target.value))} /></div></Field><Field label="Mission statement" className="sm:col-span-2"><Textarea value={form.mission} onChange={(event) => updateForm('mission', event.target.value)} /></Field></div><div className="mt-6 flex justify-end"><Button onClick={save}><Check className="h-4 w-4" />Save organization</Button></div></div></Card><Card><div className="p-5 sm:p-6"><h2 className="text-sm font-semibold text-white/75">Workspace snapshot</h2><p className="mt-1 text-xs text-white/30">The data currently powering this interface.</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[donors.length, 'Donors'], [donations.length, 'Donations'], [form.organizationName ? '1' : '0', 'Organization'], ['Local', 'Storage mode']].map(([value, label]) => <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><p className="text-lg font-semibold text-white/75">{value}</p><p className="mt-0.5 text-[9px] uppercase tracking-wider text-white/25">{label}</p></div>)}</div></div></Card></div>}

        {tab === 'team' && <Card><div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><h2 className="text-base font-semibold text-white/80">Team & access</h2><p className="mt-1 text-xs text-white/30">Control who can view and change fundraising data.</p></div><Button variant="secondary" size="sm"><UserCog className="h-4 w-4" />Invite member</Button></div><div className="mt-6 space-y-2">{[
          { name: 'Alex Rivera', email: 'alex@kindredgiving.org', role: 'Administrator', avatar: 'AR', color: 'bg-emerald-400' },
          { name: 'Jordan Lee', email: 'jordan@kindredgiving.org', role: 'Fundraiser', avatar: 'JL', color: 'bg-sky-400' },
          { name: 'Taylor Morgan', email: 'taylor@kindredgiving.org', role: 'Finance', avatar: 'TM', color: 'bg-amber-400' },
        ].map((member) => <div key={member.email} className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:flex-row sm:items-center"><span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-[#08110d]', member.color)}>{member.avatar}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-white/65">{member.name}</p><p className="mt-0.5 truncate text-[10px] text-white/28">{member.email}</p></div><select className="input-glass w-full sm:w-36" defaultValue={member.role}><option>Administrator</option><option>Fundraiser</option><option>Finance</option><option>Viewer</option></select></div>)}</div><div className="mt-5 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3 text-[10px] leading-5 text-white/35"><KeyRound className="mb-1 h-4 w-4 text-amber-200/60" />Role changes are visible in this demo. Connect your identity provider before production deployment to enforce server-side authorization.</div></div></Card>}

        {tab === 'integrations' && <div className="space-y-4"><Card><div className="p-5 sm:p-6"><h2 className="text-base font-semibold text-white/80">Connected services</h2><p className="mt-1 text-xs text-white/30">Connect the tools your team already uses.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{[
          { id: 'payments' as const, name: 'Stripe', detail: 'Process card and wallet gifts', icon: Cloud, color: 'text-violet-300', connected: true },
          { id: 'email' as const, name: 'Mailchimp', detail: 'Email delivery and audience sync', icon: Sparkles, color: 'text-amber-300', connected: true },
          { id: 'bank' as const, name: 'Plaid', detail: 'Bank transaction reconciliation', icon: RefreshCcw, color: 'text-sky-300', connected: false },
          { id: 'webhook' as const, name: 'Webhooks', detail: 'Send real-time event updates', icon: Webhook, color: 'text-emerald-300', connected: false },
        ].map((item) => <div key={item.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]"><item.icon className={cn('h-[18px] w-[18px]', item.color)} /></span><Toggle label={`Toggle ${item.name}`} checked={integrations[item.id]} onChange={(checked) => { setIntegrations((values) => ({ ...values, [item.id]: checked })); addToast({ kind: 'info', title: `${item.name} ${checked ? 'connected' : 'disconnected'}`, description: 'Integration state saved for this workspace.' }); }} /></div><h3 className="mt-4 text-sm font-semibold text-white/65">{item.name}</h3><p className="mt-1 text-[10px] leading-4 text-white/28">{item.detail}</p><p className={cn('mt-3 text-[9px] font-semibold uppercase tracking-wider', integrations[item.id] ? 'text-emerald-300' : 'text-white/25')}>{integrations[item.id] ? '● Connected' : '○ Available'}</p></div>)}</div></div></Card><Card><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Database className="mt-0.5 h-5 w-5 text-sky-300/70" /><div><p className="text-sm font-semibold text-white/65">Spring Boot API</p><p className="mt-1 text-xs text-white/30">{dataMode === 'connected' ? `${backendStatus?.donors} donors · ${backendStatus?.donations} donations · ${backendStatus?.storage}` : dataMode === 'syncing' ? 'Synchronizing the workspace…' : dataMode === 'offline' ? 'The API is unavailable; local data remains active.' : 'Local demo mode is active.'}</p></div></div><div className="flex items-center gap-2"><Badge tone={dataMode === 'connected' ? 'success' : dataMode === 'offline' ? 'danger' : 'warning'} dot>{dataMode === 'connected' ? 'API connected' : dataMode === 'offline' ? 'API offline' : dataMode === 'syncing' ? 'Syncing' : 'Local data'}</Badge>{dataMode === 'offline' && <Button size="sm" variant="secondary" onClick={syncNow}>Retry</Button>}</div></div></Card></div>}

        {tab === 'security' && <div className="space-y-4"><Card><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-[18px] w-[18px]" /></span><div><h2 className="text-base font-semibold text-white/80">Security posture</h2><p className="mt-1 text-xs text-white/30">Frontend safeguards and deployment readiness.</p></div></div><Badge tone="success">Healthy</Badge></div><div className="mt-6 space-y-2">{[
          ['Environment secrets', 'No private browser-side keys', true],
          ['Donor consent controls', `${donors.filter((donor) => donor.communicationConsent).length} consented profiles`, true],
          ['API authentication', dataMode === 'connected' ? 'Bearer token interceptor ready' : 'Local mode only', dataMode === 'connected'],
          ['Data persistence', dataMode === 'connected' ? 'Server database synchronized' : 'Browser storage active', dataMode === 'connected'],
        ].map(([label, detail, ready]) => <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3"><span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', ready ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-200')}>{ready ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-white/55">{label}</p><p className="mt-0.5 truncate text-[10px] text-white/25">{detail}</p></div></div>)}</div></div></Card><Card><div className="p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold text-white/70">Workspace data</h2><p className="mt-1 text-xs text-white/30">Restore the original sample dataset or export a backup.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={() => { const blob = new Blob([JSON.stringify({ donors, donations, settings }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'kindred-backup.json'; anchor.click(); URL.revokeObjectURL(url); addToast({ kind: 'success', title: 'Backup downloaded' }); }}><Download className="h-4 w-4" />Export backup</Button><Button variant="danger" onClick={() => setResetOpen(true)}><Trash2 className="h-4 w-4" />Reset demo</Button></div></div></div></Card></div>}

        {tab === 'notifications' && <Card><div className="p-5 sm:p-6"><h2 className="text-base font-semibold text-white/80">Notifications</h2><p className="mt-1 text-xs text-white/30">Choose which operational updates reach your inbox.</p><div className="mt-6 space-y-2">{[
          { key: 'emailNotifications' as const, title: 'Donation notifications', detail: 'Receive an email for each completed gift.' },
          { key: 'weeklyDigest' as const, title: 'Weekly giving digest', detail: 'A Monday summary of momentum and opportunities.' },
        ].map((item) => <div key={item.key} className="flex items-center gap-4 rounded-xl border border-white/[0.07] p-4"><div className="flex-1"><p className="text-xs font-semibold text-white/60">{item.title}</p><p className="mt-1 text-[10px] text-white/28">{item.detail}</p></div><Toggle label={item.title} checked={form[item.key]} onChange={(checked) => updateForm(item.key, checked)} /></div>)}</div><div className="mt-6 flex justify-end"><Button onClick={save}><Save className="h-4 w-4" />Save preferences</Button></div></div></Card>}
      </div>
    </div>
    <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo workspace?" description="This replaces local changes with the original sample data." size="sm" footer={<><Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => { resetDemo(); setResetOpen(false); setForm(useAppStore.getState().settings); addToast({ kind: 'success', title: 'Demo data restored', description: 'All sample records are back to their original state.' }); }}>Reset everything</Button></>}><div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.04] p-4"><p className="text-xs leading-5 text-white/45">Your <span className="font-semibold text-white/65">{formatNumber(donors.length)} donors</span> and <span className="font-semibold text-white/65">{formatNumber(donations.length)} donations</span> will be replaced. This action cannot be undone without a backup.</p><p className="mt-3 text-[10px] text-white/25">Most recent: {donors[0] ? donorName(donors[0]) : 'No donors'}</p></div></Modal>
  </div>;
}
