import { useCallback, useEffect, useRef } from 'react';
import { isApiConfigured } from '@/services/apiClient';
import { workspaceService } from '@/services/workspaceService';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';

export function useBackendSync() {
  const donors = useAppStore((state) => state.donors);
  const donations = useAppStore((state) => state.donations);
  const campaigns = useAppStore((state) => state.campaigns);
  const replaceData = useAppStore((state) => state.replaceData);
  const setDataMode = useUIStore((state) => state.setDataMode);
  const setBackendStatus = useUIStore((state) => state.setBackendStatus);
  const setSyncNow = useUIStore((state) => state.setSyncNow);
  const started = useRef(false);

  const sync = useCallback(async () => {
    if (!isApiConfigured) {
      setDataMode('local');
      setBackendStatus(null);
      return;
    }

    setDataMode('syncing');
    try {
      await workspaceService.status();
      await workspaceService.importWorkspace({ donors, donations, campaigns });
      const { data: workspace } = await workspaceService.bootstrap();
      replaceData({
        donors: workspace.donors,
        donations: workspace.donations,
        campaigns: workspace.campaigns,
      });
      setBackendStatus({
        storage: workspace.status.storage,
        donors: workspace.status.donors,
        donations: workspace.status.donations,
        campaigns: workspace.status.campaigns,
        lastSyncedAt: new Date().toISOString(),
      });
      setDataMode('connected');
    } catch {
      setDataMode('offline');
      setBackendStatus(null);
    }
  }, [campaigns, donors, donations, replaceData, setBackendStatus, setDataMode]);

  useEffect(() => {
    setSyncNow(() => { void sync(); });
    if (started.current) return;
    started.current = true;
    void sync();
  }, [setSyncNow, sync]);

  useEffect(() => () => setSyncNow(() => undefined), [setSyncNow]);

  return { sync };
}
