import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronRight,
  CircleHelp,
  FileText,
  HandHeart,
  LayoutDashboard,
  Mail,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  UsersRound,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
import { cn, donorName, formatCurrency, formatRelativeDate } from '@/lib/utils';
import { DonationModal } from './DonationModal';

const primaryNav = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Donors', path: '/donors', icon: UsersRound },
  { label: 'Donations', path: '/donations', icon: HandHeart },
  { label: 'Campaigns', path: '/campaigns', icon: Target },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const secondaryNav = [
  { label: 'Communications', path: '/communications', icon: Mail },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Giving Assistant', path: '/assistant', icon: Sparkles },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const mobileNav = primaryNav.slice(0, 4);
const allPages = [...primaryNav, ...secondaryNav];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const organizationName = useAppStore((state) => state.settings.organizationName);
  const dataMode = useUIStore((state) => state.dataMode);
  const backendStatus = useUIStore((state) => state.backendStatus);
  const connection = dataMode === 'connected'
    ? { label: 'Spring API connected', dot: 'bg-emerald-350' }
    : dataMode === 'syncing'
      ? { label: 'Syncing workspace', dot: 'animate-pulse bg-amber-300' }
      : dataMode === 'offline'
        ? { label: 'API offline', dot: 'bg-red-300' }
        : { label: 'Local demo', dot: 'bg-white/35' };
  const renderNav = (items: typeof primaryNav) => items.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) => cn(
        'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all',
        isActive
          ? 'bg-emerald-400/[0.09] text-emerald-300'
          : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80',
      )}
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute -left-[17px] h-5 w-[2px] rounded-full bg-emerald-350 shadow-[0_0_14px_#4adea4]" />}
          <item.icon className={cn('h-[17px] w-[17px] transition', isActive ? 'text-emerald-350' : 'text-white/35 group-hover:text-white/65')} strokeWidth={1.8} />
          <span>{item.label}</span>
          {item.label === 'Giving Assistant' && <span className="ml-auto rounded-full border border-emerald-400/15 bg-emerald-400/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">AI</span>}
        </>
      )}
    </NavLink>
  ));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.055] px-5">
        <img src="/logo.svg" alt="" className="h-9 w-9" />
        <div>
          <p className="font-display text-xl leading-none tracking-wide text-white">Kindred</p>
          <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.26em] text-emerald-350/65">Giving Intelligence</p>
        </div>
      </div>
      <div className="border-b border-white/[0.055] px-4 py-4">
        <div className="rounded-xl border border-white/[0.055] bg-white/[0.025] p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-350 to-emerald-550 text-xs font-bold text-[#07110d]">KC</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/85">{organizationName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/30" title={backendStatus ? `${backendStatus.storage} · Last synced ${backendStatus.lastSyncedAt}` : undefined}><span className={cn('h-1.5 w-1.5 rounded-full', connection.dot)} /> {connection.label}</p>
            </div>
            <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/25" />
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/24">Workspace</p>
        <div className="space-y-1">{renderNav(primaryNav)}</div>
        <p className="mb-2 mt-7 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/24">Engage & manage</p>
        <div className="space-y-1">{renderNav(secondaryNav)}</div>
      </nav>
      <div className="border-t border-white/[0.055] p-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-400/[0.08] to-transparent p-4">
          <div className="flex items-center gap-2 text-emerald-300"><CircleHelp className="h-4 w-4" /><span className="text-xs font-semibold">Need a hand?</span></div>
          <p className="mt-2 text-[11px] leading-5 text-white/35">Explore the quick guide or reach our giving success team.</p>
          <button className="mt-3 text-[11px] font-semibold text-emerald-300 transition hover:text-emerald-200">Visit help center →</button>
        </div>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const open = useUIStore((state) => state.globalSearchOpen);
  const setOpen = useUIStore((state) => state.setGlobalSearchOpen);
  const [query, setQuery] = useState('');
  const donors = useAppStore((state) => state.donors);
  const campaigns = useAppStore((state) => state.campaigns);
  const navigate = useNavigate();
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return { donors: donors.slice(0, 4), campaigns: campaigns.slice(0, 3), pages: allPages.slice(0, 4) };
    return {
      donors: donors.filter((donor) => `${donorName(donor)} ${donor.email}`.toLowerCase().includes(term)).slice(0, 5),
      campaigns: campaigns.filter((campaign) => `${campaign.name} ${campaign.category}`.toLowerCase().includes(term)).slice(0, 4),
      pages: allPages.filter((page) => page.label.toLowerCase().includes(term)).slice(0, 4),
    };
  }, [query, donors, campaigns]);

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Search Kindred" description="Find a donor, campaign, or workspace." size="lg">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, or campaign…" className="h-12 pl-10 text-base" />
      </div>
      <div className="mt-5 space-y-5">
        {results.pages.length > 0 && (
          <div><p className="eyebrow mb-2">Workspace</p><div className="grid gap-1 sm:grid-cols-2">{results.pages.map((page) => <button key={page.path} onClick={() => go(page.path)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"><page.icon className="h-4 w-4 text-white/35" />{page.label}</button>)}</div></div>
        )}
        {results.donors.length > 0 && (
          <div><p className="eyebrow mb-2">Donors</p><div className="space-y-1">{results.donors.map((donor) => <button key={donor.id} onClick={() => go(`/donors?donor=${donor.id}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-[10px] font-bold text-emerald-300">{donor.firstName.charAt(0)}{donor.lastName.charAt(0)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-white/80">{donorName(donor)}</span><span className="block truncate text-xs text-white/30">{donor.email}</span></span><span className="text-xs text-white/35">{formatCurrency(donor.totalGiven, 'USD', true)}</span></button>)}</div></div>
        )}
        {results.campaigns.length > 0 && (
          <div><p className="eyebrow mb-2">Campaigns</p><div className="space-y-1">{results.campaigns.map((campaign) => <button key={campaign.id} onClick={() => go('/campaigns')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"><span className="h-8 w-1 rounded-full" style={{ backgroundColor: campaign.accent }} /><span className="flex-1 text-sm text-white/75">{campaign.name}</span><span className="text-xs text-white/35">{campaign.category}</span></button>)}</div></div>
        )}
        {results.pages.length + results.donors.length + results.campaigns.length === 0 && <div className="py-10 text-center"><Search className="mx-auto h-8 w-8 text-white/15" /><p className="mt-3 text-sm text-white/40">No results for “{query}”</p></div>}
      </div>
    </Modal>
  );
}

function Notifications() {
  const open = useUIStore((state) => state.notificationsOpen);
  const setOpen = useUIStore((state) => state.setNotificationsOpen);
  const activities = useAppStore((state) => state.activities).slice(0, 5);
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative" aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-emerald-350 ring-2 ring-ink" />
      </Button>
      {open && (
        <div className="glass-panel absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-32px))] animate-scale-in rounded-2xl bg-[#111718]/95 p-2 shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2"><p className="text-sm font-semibold text-white">Notifications</p><button onClick={() => setOpen(false)} className="text-white/30 hover:text-white"><X className="h-4 w-4" /></button></div>
          <div className="space-y-0.5">{activities.map((activity) => <div key={activity.id} className="rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]"><p className="text-xs font-medium text-white/75">{activity.title}</p><p className="mt-0.5 truncate text-[11px] text-white/35">{activity.description}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-emerald-350/60">{formatRelativeDate(activity.timestamp)}</p></div>)}</div>
          <button className="mt-1 w-full border-t border-white/[0.06] py-3 text-[11px] font-semibold text-emerald-300">Mark all as read</button>
        </div>
      )}
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const mobileNavOpen = useUIStore((state) => state.mobileNavOpen);
  const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen);
  const setGlobalSearchOpen = useUIStore((state) => state.setGlobalSearchOpen);
  const setDonationModalOpen = useUIStore((state) => state.setDonationModalOpen);
  const donationModalOpen = useUIStore((state) => state.donationModalOpen);
  const dataMode = useUIStore((state) => state.dataMode);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, setMobileNavOpen]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setGlobalSearchOpen]);

  return (
    <div className="noise min-h-screen text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[246px] border-r border-white/[0.06] bg-[#0b1011]/85 backdrop-blur-2xl lg:block"><SidebarContent /></aside>
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" />
          <aside className="glass-panel absolute inset-y-0 left-0 w-[min(290px,86vw)] animate-scale-in border-r border-white/10 bg-[#0b1011]"><div className="absolute right-3 top-4 z-10"><Button size="icon" variant="ghost" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></Button></div><SidebarContent onNavigate={() => setMobileNavOpen(false)} /></aside>
        </div>
      )}
      <div className="min-h-screen lg:pl-[246px]">
        <header className="no-print sticky top-0 z-30 flex h-[70px] items-center border-b border-white/[0.055] bg-[#080b0d]/75 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          <button onClick={() => setGlobalSearchOpen(true)} className="flex h-9 w-full max-w-[340px] items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 text-left text-xs text-white/28 transition hover:border-white/[0.12] hover:bg-white/[0.05] sm:text-[13px]">
            <Search className="h-4 w-4" /><span className="flex-1 truncate">Search anything…</span><kbd className="hidden rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-sans text-[9px] text-white/30 sm:block">⌘ K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <span className="hidden h-7 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 text-[9px] font-semibold uppercase tracking-wider text-white/35 md:flex">
              <span className={cn('h-1.5 w-1.5 rounded-full', dataMode === 'connected' ? 'bg-emerald-350' : dataMode === 'syncing' ? 'animate-pulse bg-amber-300' : dataMode === 'offline' ? 'bg-red-300' : 'bg-white/30')} />
              {dataMode === 'connected' ? 'API synced' : dataMode === 'syncing' ? 'Syncing' : dataMode === 'offline' ? 'Offline' : 'Local'}
            </span>
            <Notifications />
            <Button size="sm" onClick={() => setDonationModalOpen(true)} className="hidden sm:inline-flex"><Plus className="h-4 w-4" />Record gift</Button>
            <button className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-emerald-300/90 to-emerald-500 text-xs font-bold text-[#07110d] ring-2 ring-white/[0.03]" aria-label="Open profile">AR</button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1580px] px-4 pb-28 pt-7 sm:px-6 lg:px-8 lg:pb-10 lg:pt-9"><Outlet /></main>
      </div>
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 flex h-[68px] items-center justify-around border-t border-white/[0.08] bg-[#0b1011]/90 px-2 backdrop-blur-2xl lg:hidden" aria-label="Mobile navigation">
        {mobileNav.map((item) => <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => cn('flex min-w-14 flex-col items-center gap-1 text-[9px] font-medium transition', isActive ? 'text-emerald-300' : 'text-white/35')}><item.icon className="h-[18px] w-[18px]" /><span>{item.label}</span></NavLink>)}
        <button onClick={() => setMoreOpen(!moreOpen)} className={cn('flex min-w-14 flex-col items-center gap-1 text-[9px] font-medium transition', moreOpen ? 'text-emerald-300' : 'text-white/35')}><Menu className="h-[18px] w-[18px]" /><span>More</span></button>
      </nav>
      {moreOpen && <div className="no-print fixed inset-x-3 bottom-[76px] z-50 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#121819]/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">{secondaryNav.map((item) => <NavLink key={item.path} to={item.path} className="flex items-center gap-3 rounded-xl bg-white/[0.035] px-3 py-3 text-xs text-white/60"><item.icon className="h-4 w-4 text-emerald-350/70" />{item.label}</NavLink>)}</div>}
      <GlobalSearch />
      <DonationModal open={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
    </div>
  );
}
