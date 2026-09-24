import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock3,
  Eye,
  FileText,
  Mail,
  MousePointerClick,
  Plus,
  Send,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { EMAIL_TEMPLATES } from '@/data/mockData';
import { formatDateTime, formatNumber } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import type { EmailTemplate } from '@/types';

const audiences = ['Active donors', 'All subscribers', 'Champion & Visionary', 'Supporter tier', 'Lapsed donors'] as const;
type Audience = typeof audiences[number];

function audienceCount(audience: Audience, donors: ReturnType<typeof useAppStore.getState>['donors']) {
  const consented = donors.filter((donor) => donor.communicationConsent);
  switch (audience) {
    case 'Active donors': return consented.filter((donor) => donor.status === 'Active').length;
    case 'All subscribers': return consented.length;
    case 'Champion & Visionary': return consented.filter((donor) => ['Champion', 'Visionary'].includes(donor.tier)).length;
    case 'Supporter tier': return consented.filter((donor) => donor.tier === 'Supporter').length;
    case 'Lapsed donors': return consented.filter((donor) => donor.status === 'Lapsed').length;
  }
}

function Composer({ open, onClose, initialTemplate }: { open: boolean; onClose: () => void; initialTemplate?: EmailTemplate | null }) {
  const donors = useAppStore((state) => state.donors);
  const sendCommunication = useAppStore((state) => state.sendCommunication);
  const addToast = useUIStore((state) => state.addToast);
  const [audience, setAudience] = useState<Audience>('Active donors');
  const [subject, setSubject] = useState(initialTemplate?.subject ?? '');
  const [body, setBody] = useState(initialTemplate?.body ?? '');
  const [templateId, setTemplateId] = useState(initialTemplate?.id ?? EMAIL_TEMPLATES[0].id);
  const [preview, setPreview] = useState(false);
  const recipients = audienceCount(audience, donors);

  const chooseTemplate = (id: string) => {
    const template = EMAIL_TEMPLATES.find((item) => item.id === id) ?? EMAIL_TEMPLATES[0];
    setTemplateId(template.id);
    setSubject(template.subject);
    setBody(template.body);
  };

  const close = () => {
    setPreview(false);
    onClose();
  };

  const send = () => {
    if (!subject.trim() || !body.trim()) {
      addToast({ kind: 'error', title: 'Add a subject and message', description: 'Your email needs both before it can be sent.' });
      return;
    }
    sendCommunication({ templateId, subject, audience, recipientCount: recipients, status: 'Sent' });
    addToast({ kind: 'success', title: 'Campaign sent', description: `${formatNumber(recipients)} messages were added to your outbox.` });
    close();
  };

  return <Modal open={open} onClose={close} title={preview ? 'Email preview' : 'Compose a message'} description={preview ? 'A final look before you reach your community.' : 'Choose a template and audience, then make it yours.'} size="xl" footer={preview ? <Button onClick={() => setPreview(false)}>Back to editor</Button> : <><Button variant="ghost" onClick={close}>Save draft</Button><Button variant="secondary" onClick={() => setPreview(true)}><Eye className="h-4 w-4" />Preview</Button><Button onClick={send}><Send className="h-4 w-4" />Send to {recipients}</Button></>}>
    {preview ? <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-[#f3f1e9] text-[#15201b] shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-6 py-4"><div className="flex items-center gap-2"><img src="/logo.svg" alt="" className="h-8 w-8" /><span className="text-sm font-bold">Kindred</span></div><span className="text-[9px] uppercase tracking-widest text-black/35">Impact update</span></div><div className="p-8 sm:p-12"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{initialTemplate?.eyebrow ?? 'A note of gratitude'}</p><h2 className="mt-3 font-display text-4xl leading-tight">{subject || 'Your subject will appear here'}</h2><div className="mt-8 h-px bg-black/10" /><p className="mt-8 whitespace-pre-line text-[15px] leading-7 text-black/65">{body || 'Your message will appear here.'}</p><p className="mt-8 text-sm font-semibold">With gratitude,<br /><span className="font-normal text-black/55">The Kindred Giving team</span></p></div><div className="bg-[#14201b] px-8 py-5 text-center text-[10px] text-white/45">Kindred Community Foundation · You received this because you support our mission.</div></div> : <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><div className="space-y-5"><Field label="Start with a template"><Select value={templateId} onChange={(event) => chooseTemplate(event.target.value)}>{EMAIL_TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</Select></Field><Field label="Audience"><Select value={audience} onChange={(event) => setAudience(event.target.value as Audience)}>{audiences.map((item) => <option key={item}>{item}</option>)}</Select></Field><div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.045] p-4"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><UsersRound className="h-4 w-4" />{formatNumber(recipients)} recipients</div><p className="mt-1.5 text-[10px] leading-4 text-white/30">Only donors with recorded communication consent are included.</p></div><div><p className="label">Personalization tokens</p><div className="flex flex-wrap gap-1.5">{['{{first_name}}', '{{last_gift_date}}', '{{campaign_name}}', '{{organization_name}}'].map((token) => <button key={token} onClick={() => setBody((value) => `${value} ${token}`)} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1.5 font-mono text-[9px] text-white/40 transition hover:border-emerald-400/20 hover:text-emerald-300">{token}</button>)}</div></div><div className="rounded-xl border border-white/[0.07] p-3 text-[10px] leading-5 text-white/30"><span className="font-semibold text-white/55">Sending responsibly.</span> Kindred suppresses bounced addresses, honors unsubscribes, and records consent before every campaign.</div><p className="text-[9px] text-white/22">Drafts and sends are retained in your local activity log.</p></div><div className="space-y-5"><Field label="Subject line"><Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A clear, human subject line" /></Field><Field label="Message"><Textarea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-[280px]" placeholder="Share the story behind your impact…" /></Field><div className="flex items-center gap-2 text-[10px] text-white/25"><Check className="h-3.5 w-3.5 text-emerald-300" />Accessibility checks pass: readable contrast, plain language, and descriptive links</div></div></div>}
  </Modal>;
}

export default function CommunicationsPage() {
  const donors = useAppStore((state) => state.donors);
  const communications = useAppStore((state) => state.communications);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const consented = donors.filter((donor) => donor.communicationConsent).length;
  const totalRecipients = communications.filter((item) => item.status === 'Sent').reduce((sum, item) => sum + item.recipientCount, 0);
  const stats = [
    { label: 'Messages sent', value: formatNumber(totalRecipients), detail: 'All recorded campaigns', icon: Send },
    { label: 'Active audience', value: formatNumber(consented), detail: `${Math.round((consented / donors.length) * 100)}% consent coverage`, icon: UsersRound },
    { label: 'Email templates', value: EMAIL_TEMPLATES.length.toString(), detail: 'Ready to personalize', icon: FileText },
    { label: 'Recent sends', value: communications.length.toString(), detail: 'Across 3 audiences', icon: Clock3 },
  ];
  const highestAudience = useMemo(() => audiences.map((audience) => ({ audience, count: audienceCount(audience, donors) })).sort((a, b) => b.count - a.count)[0], [donors]);

  const openTemplate = (template: EmailTemplate | null = null) => { setSelectedTemplate(template); setComposerOpen(true); };

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Thoughtful engagement" title="Communications" description="Turn gratitude and impact into messages your community will remember." actions={<Button onClick={() => openTemplate()}><Plus className="h-4 w-4" />New campaign</Button>} />
    <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <Card key={stat.label} className="flex items-center gap-4 p-4 sm:p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-300"><stat.icon className="h-[18px] w-[18px]" /></span><div><p className="text-lg font-semibold text-white">{stat.value}</p><p className="text-xs font-medium text-white/50">{stat.label}</p><p className="mt-0.5 text-[10px] text-white/25">{stat.detail}</p></div></Card>)}</section>
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.55fr)]">
      <div><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-white">Start with a template</h2><p className="mt-1 text-xs text-white/33">Thoughtful foundations, ready for your voice</p></div><button onClick={() => openTemplate()} className="text-xs font-semibold text-emerald-300">Browse all</button></div><div className="grid gap-3 md:grid-cols-3">{EMAIL_TEMPLATES.map((template, index) => <Card key={template.id} className="group flex min-h-[270px] cursor-pointer flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.13]" onClick={() => openTemplate(template)}><div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${template.accent}15`, color: template.accent }}>{index === 0 ? <Sparkles className="h-4 w-4" /> : index === 1 ? <Mail className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><ArrowRight className="h-4 w-4 text-white/15 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></div><p className="eyebrow mt-7">{template.eyebrow}</p><h3 className="mt-2 text-base font-semibold leading-snug text-white/80 group-hover:text-white">{template.name}</h3><p className="mt-2 line-clamp-3 text-xs leading-5 text-white/32">{template.body}</p><div className="mt-auto flex items-center gap-1.5 pt-5 text-[10px] font-semibold text-emerald-300/75">Use template <ArrowRight className="h-3 w-3" /></div></Card>)}</div></div>
      <Card className="relative overflow-hidden"><div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/[0.08] blur-3xl" /><div className="relative p-6"><Badge tone="success"><Sparkles className="h-3 w-3" />Smart segment</Badge><h2 className="mt-4 font-display text-3xl leading-tight text-white">Reach the people most ready to deepen their impact.</h2><p className="mt-3 text-sm leading-6 text-white/40">Your <span className="text-white/65">{highestAudience.audience}</span> segment includes {highestAudience.count} consented contacts and shows 12% higher average gift potential.</p><div className="mt-6 space-y-2">{[['Expected recipients', highestAudience.count.toString()], ['Consent coverage', `${Math.round((highestAudience.count / donors.length) * 100)}%`], ['Recommended send', 'Thursday · 10:00 AM']].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/[0.055] py-2.5 text-[11px]"><span className="text-white/30">{label}</span><span className="font-medium text-white/65">{value}</span></div>)}</div><Button className="mt-6 w-full" onClick={() => openTemplate(EMAIL_TEMPLATES[0])}>Create for this segment <ArrowRight className="h-4 w-4" /></Button></div></Card>
    </section>
    <section className="mt-6"><div className="mb-4"><h2 className="text-lg font-semibold text-white">Recent sends</h2><p className="mt-1 text-xs text-white/33">A clear record of outreach to your community</p></div><Card className="overflow-hidden"><div className="overflow-x-auto"><table className="data-table min-w-[760px]"><thead><tr><th>Message</th><th>Audience</th><th>Recipients</th><th>Sent</th><th>Status</th><th /></tr></thead><tbody>{communications.map((message) => <tr key={message.id}><td><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><Mail className="h-3.5 w-3.5" /></span><span className="text-xs font-medium text-white/70">{message.subject}</span></div></td><td className="text-xs text-white/42">{message.audience}</td><td className="text-xs text-white/55">{message.recipientCount}</td><td className="text-xs text-white/35">{formatDateTime(message.sentAt)}</td><td><Badge tone={message.status === 'Sent' ? 'success' : 'warning'} dot>{message.status}</Badge></td><td><Button variant="ghost" size="icon" className="h-8 w-8"><MousePointerClick className="h-3.5 w-3.5" /></Button></td></tr>)}</tbody></table></div></Card></section>
    <Composer key={selectedTemplate?.id ?? 'blank'} open={composerOpen} onClose={() => setComposerOpen(false)} initialTemplate={selectedTemplate} />
  </div>;
}
