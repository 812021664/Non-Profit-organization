import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { useBackendSync } from '@/hooks/useBackendSync';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { ToastRegion } from '@/components/ui/ToastRegion';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DonorsPage = lazy(() => import('@/pages/DonorsPage'));
const DonationsPage = lazy(() => import('@/pages/DonationsPage'));
const CampaignsPage = lazy(() => import('@/pages/CampaignsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const CommunicationsPage = lazy(() => import('@/pages/CommunicationsPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const AssistantPage = lazy(() => import('@/pages/AssistantPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function PageLoader() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading page">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-white/[0.05]" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/[0.03]" />
      <div className="grid gap-3 pt-5 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]" />)}</div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"><HeartHandshake className="h-7 w-7" /></span>
      <p className="eyebrow mt-6">404 · Page not found</p>
      <h1 className="mt-2 font-display text-5xl text-white">Let’s find the right path.</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/38">The workspace you requested does not exist or may have moved.</p>
      <a href="/" className="mt-6"><Button><ArrowLeft className="h-4 w-4" />Back to overview</Button></a>
    </div>
  );
}

export default function App() {
  useBackendSync();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="donors" element={<DonorsPage />} />
            <Route path="donations" element={<DonationsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="communications" element={<CommunicationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
      <ToastRegion />
    </BrowserRouter>
  );
}
