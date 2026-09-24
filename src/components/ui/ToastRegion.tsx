import { useEffect } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useUIStore, type ToastMessage } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    const timer = window.setTimeout(() => removeToast(toast.id), 4200);
    return () => window.clearTimeout(timer);
  }, [removeToast, toast.id]);

  const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? XCircle : Info;
  return (
    <div className="glass-panel flex w-[min(390px,calc(100vw-32px))] animate-scale-in items-start gap-3 rounded-2xl p-4 shadow-2xl" role="status">
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', toast.kind === 'success' ? 'text-emerald-350' : toast.kind === 'error' ? 'text-red-300' : 'text-sky-300')} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs leading-5 text-white/45">{toast.description}</p>}
      </div>
      <button onClick={() => removeToast(toast.id)} className="rounded p-1 text-white/30 hover:bg-white/5 hover:text-white" aria-label="Dismiss notification">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastRegion() {
  const toasts = useUIStore((state) => state.toasts);
  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[120] flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      {toasts.map((toast) => <div key={toast.id} className="pointer-events-auto"><ToastItem toast={toast} /></div>)}
    </div>
  );
}
