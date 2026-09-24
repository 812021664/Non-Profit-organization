import { useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  BarChart3,
  Bot,
  Database,
  Lightbulb,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { completedDonations, periodStats, retentionRate } from '@/lib/analytics';
import { formatCurrency, formatNumber, percent, uid } from '@/lib/utils';
import { askAssistant } from '@/services/assistantService';
import { useAppStore } from '@/store/useAppStore';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  source?: 'local' | 'api';
  suggestions?: string[];
}

const suggestedQuestions = [
  'How are we tracking this month?',
  'Who should we re-engage?',
  'Which campaign is leading?',
  'What is our average gift?',
  'Which channel drives the most giving?',
];

function buildLocalAnswer(question: string, donors: ReturnType<typeof useAppStore.getState>['donors'], donations: ReturnType<typeof useAppStore.getState>['donations'], campaigns: ReturnType<typeof useAppStore.getState>['campaigns']): Omit<ChatMessage, 'id' | 'role'> {
  const normalized = question.toLowerCase();
  const completed = completedDonations(donations);
  const month = periodStats(donations, 30);
  const total = completed.reduce((sum, donation) => sum + donation.amount, 0);
  const average = completed.length ? total / completed.length : 0;
  const activeDonors = donors.filter((donor) => donor.status === 'Active');
  const lapsed = donors.filter((donor) => donor.status === 'Lapsed');
  const rankedCampaigns = [...campaigns].sort((a, b) => b.raised - a.raised);
  const channelTotals = donations.filter((donation) => donation.status === 'Completed').reduce<Record<string, number>>((totals, donation) => ({ ...totals, [donation.channel]: (totals[donation.channel] ?? 0) + donation.amount }), {});
  const topChannel = Object.entries(channelTotals).sort((a, b) => b[1] - a[1])[0];

  if (normalized.includes('month') || normalized.includes('tracking') || normalized.includes('this')) {
    const change = month.previousAmount ? ((month.amount - month.previousAmount) / month.previousAmount) * 100 : 0;
    return { content: `This month, Kindred has recorded ${formatCurrency(month.amount)} across ${formatNumber(month.count)} completed gifts—${change >= 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% from the prior 30 days.\n\nThe strongest next step is to follow up with recent first-time donors while the giving moment is fresh.`, suggestions: ['Who gave most recently?', 'Which campaign is leading?'] };
  }
  if (normalized.includes('re-engage') || normalized.includes('lapsed') || normalized.includes('segment')) {
    return { content: `You have ${lapsed.length} lapsed donors and ${donors.filter((donor) => donor.status === 'New').length} new supporters. Prioritize lapsed donors with at least three historical gifts, then send a personal update tied to the community they supported.\n\nA focused re-engagement message to this segment is more likely to outperform a broad broadcast.`, suggestions: ['Create a re-engagement email', 'What is our donor retention?'] };
  }
  if (normalized.includes('campaign') || normalized.includes('leading') || normalized.includes('goal')) {
    const leader = rankedCampaigns[0];
    return { content: `${leader.name} is leading with ${formatCurrency(leader.raised)} raised—${percent(leader.raised, leader.goal).toFixed(0)}% of its ${formatCurrency(leader.goal)} goal.\n\n${leader.donorCount} supporters have participated. The next useful view is revenue velocity: whether recent gifts are keeping this campaign on pace to finish by its deadline.`, suggestions: ['Compare all campaigns', 'What is our overall goal progress?'] };
  }
  if (normalized.includes('average') || normalized.includes('gift size')) {
    return { content: `Your all-time average completed gift is ${formatCurrency(average)} across ${formatNumber(completed.length)} donations. Median giving is often the better benchmark for an organization your size because a few large gifts can pull the average upward.\n\nTo lift the average sustainably, focus on a clear next-step ask after a supporter’s first gift.`, suggestions: ['Show the gift distribution', 'Who are our top donors?'] };
  }
  if (normalized.includes('channel') || normalized.includes('source') || normalized.includes('online')) {
    return { content: `${topChannel?.[0] ?? 'Online'} is your strongest source, generating ${formatCurrency(topChannel?.[1] ?? 0)} in completed gifts.\n\nRecurring and partner channels are the best secondary opportunities. Their donor histories suggest stronger retention, so a personalized upgrade invitation is more appropriate than a discount.`, suggestions: ['What is our donor retention?', 'Which campaign is leading?'] };
  }
  if (normalized.includes('retention')) {
    return { content: `Your 90-day donor retention is ${retentionRate(completed).toFixed(1)}%. ${activeDonors.length} donors are currently active, representing ${percent(activeDonors.length, donors.length).toFixed(0)}% of your community.\n\nRetention is strongest among Champion and Sustainer relationships. Focus next on moving engaged Supporters into a recurring or multi-gift journey.`, suggestions: ['What is our average gift?', 'Who should we re-engage?'] };
  }
  if (normalized.includes('top donor') || normalized.includes('largest')) {
    const topDonors = [...donors].sort((a, b) => b.totalGiven - a.totalGiven).slice(0, 3);
    return { content: `Your top lifetime supporters are:\n\n${topDonors.map((donor, index) => `${index + 1}. ${donor.firstName} ${donor.lastName} — ${formatCurrency(donor.totalGiven)} across ${donor.donationCount} gifts`).join('\n')}\n\nThese relationships deserve personal, high-touch recognition rather than a broad campaign.`, suggestions: ['How do we retain top donors?', 'Create a gratitude note'] };
  }
  return { content: `I can answer questions grounded in your donor, donation, and campaign records. Right now the workspace contains ${formatNumber(donors.length)} donors, ${formatNumber(donations.length)} donations, and ${campaigns.length} campaigns.\n\nTry asking about this month’s performance, donor retention, average gifts, campaign progress, or your strongest giving channel.`, suggestions: suggestedQuestions.slice(0, 3) };
}

export default function AssistantPage() {
  const donors = useAppStore((state) => state.donors);
  const donations = useAppStore((state) => state.donations);
  const campaigns = useAppStore((state) => state.campaigns);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello, I’m your Giving Assistant. Ask me about fundraising momentum, donor behavior, campaign progress, or where your next best opportunity may be.', source: 'local' },
  ]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const context = useMemo(() => ({ donors: donors.length, donations: donations.length, campaigns: campaigns.length }), [donors, donations, campaigns]);

  const ask = async (prompt: string) => {
    const value = prompt.trim();
    if (!value || loading) return;
    const userMessage: ChatMessage = { id: uid('message'), role: 'user', content: value };
    const assistantId = uid('answer');
    setMessages((current) => [...current, userMessage, { id: assistantId, role: 'assistant', content: '', source: 'local' }]);
    setQuestion('');
    setLoading(true);
    try {
      const response = await askAssistant(value);
      const answer = response.source === 'api' && response.answer ? response : buildLocalAnswer(value, donors, donations, campaigns);
      setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, ...answer, source: response.source } : message));
    } catch {
      const answer = buildLocalAnswer(value, donors, donations, campaigns);
      setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, ...answer } : message));
    } finally {
      setLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return <div className="animate-fade-up">
    <PageHeader eyebrow="Evidence, not guesswork" title="Giving Assistant" description="Ask natural questions and get clear, grounded answers from your giving data." actions={<Badge tone="success"><ShieldCheck className="h-3 w-3" />Private by design</Badge>} />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_320px]">
      <Card className="flex min-h-[650px] flex-col overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4"><span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-350 to-emerald-550 text-[#07110d]"><Sparkles className="h-4 w-4" /><span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111718] bg-emerald-200" /></span><div><p className="text-sm font-semibold text-white/80">Kindred Giving Assistant</p><p className="mt-0.5 text-[10px] text-white/30">Connected to {formatNumber(context.donors + context.donations + context.campaigns)} records</p></div><Badge tone="success" dot className="ml-auto">Ready</Badge></div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {messages.length === 1 && <div className="mb-7 grid gap-2 sm:grid-cols-2">{suggestedQuestions.map((prompt) => <button key={prompt} onClick={() => void ask(prompt)} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left text-xs text-white/45 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.035] hover:text-white/70"><Lightbulb className="h-3.5 w-3.5 shrink-0 text-emerald-300/50" />{prompt}<ArrowUp className="ml-auto h-3.5 w-3.5 -rotate-45 text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300" /></button>)}</div>}
          {messages.map((message) => (
            <div key={message.id} className={message.role === 'user' ? 'ml-auto max-w-[85%]' : 'max-w-[90%]'}>
              {message.role === 'user' ? (
                <div className="rounded-2xl rounded-br-md bg-emerald-400 px-4 py-3 text-sm leading-6 text-[#07110d]">{message.content}</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/70"><Bot className="h-3.5 w-3.5" />Kindred Assistant</div>
                  <div className="mt-2 whitespace-pre-line rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
                    {message.content || <span className="flex items-center gap-2 text-white/25"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-350" />Analyzing your giving data…</span>}
                    {message.content && message.source && <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.06] pt-2 text-[9px] uppercase tracking-wider text-white/20"><Database className="h-3 w-3" />{message.source === 'api' ? 'Assistant response' : 'Calculated on device'}</div>}
                  </div>
                  {message.suggestions && <div className="mt-2 flex flex-wrap gap-2">{message.suggestions.map((suggestion) => <button key={suggestion} onClick={() => void ask(suggestion)} className="rounded-lg border border-emerald-400/12 bg-emerald-400/[0.035] px-2.5 py-1.5 text-[10px] text-emerald-300/70 transition hover:bg-emerald-400/[0.07]">{suggestion}</button>)}</div>}
                </>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); void ask(question); }} className="sticky bottom-0 border-t border-white/[0.07] bg-[#111718]/95 p-4 backdrop-blur-xl sm:p-5"><div className="flex items-end gap-2 rounded-2xl border border-white/[0.09] bg-black/20 p-2 transition focus-within:border-emerald-400/30 focus-within:ring-2 focus-within:ring-emerald-400/[0.06]"><textarea ref={inputRef} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void ask(question); } }} rows={1} placeholder="Ask about revenue, donors, campaigns…" className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none" /><Button type="submit" size="icon" loading={loading} disabled={!question.trim()} aria-label="Send question"><Send className="h-4 w-4" /></Button></div><p className="mt-2 text-center text-[9px] text-white/20">Answers use your workspace data. Review important decisions before acting.</p></form>
      </Card>
      <aside className="space-y-4">
        <Card><div className="p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-300" /><h2 className="text-sm font-semibold text-white/80">What I can help with</h2></div><div className="mt-4 space-y-3">{[{ icon: BarChart3, label: 'Revenue & trends', detail: 'Totals, averages, momentum' }, { icon: UsersRound, label: 'Donor intelligence', detail: 'Segments, retention, next actions' }, { icon: Target, label: 'Campaign health', detail: 'Goals, pacing, comparisons' }, { icon: MessageCircle, label: 'Recommended outreach', detail: 'Who to contact and why' }].map((item) => <div key={item.label} className="flex items-start gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/40"><item.icon className="h-3.5 w-3.5" /></span><div><p className="text-xs font-medium text-white/55">{item.label}</p><p className="mt-0.5 text-[10px] text-white/25">{item.detail}</p></div></div>)}</div></div></Card>
        <Card><div className="p-5"><p className="eyebrow">Data context</p><div className="mt-4 space-y-2">{[[formatNumber(context.donors), 'Donor profiles'], [formatNumber(context.donations), 'Donation records'], [formatNumber(context.campaigns), 'Campaigns'], ['Current', 'Data freshness']].map(([value, label]) => <div key={label} className="flex items-center justify-between rounded-lg bg-white/[0.025] px-3 py-2.5"><span className="text-[10px] text-white/30">{label}</span><span className="text-[10px] font-semibold text-white/60">{value}</span></div>)}</div></div></Card>
        <Card className="relative overflow-hidden"><div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/[0.08] blur-3xl" /><div className="relative p-5"><ShieldCheck className="h-5 w-5 text-emerald-300" /><h3 className="mt-3 text-sm font-semibold text-white/70">Your data stays yours.</h3><p className="mt-2 text-[11px] leading-5 text-white/30">Without a configured backend, answers are calculated entirely in your browser. No private API key is shipped to the frontend.</p></div></Card>
      </aside>
    </div>
  </div>;
}
