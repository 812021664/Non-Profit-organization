import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-label="Close dialog" />
      <div className={cn('glass-panel relative z-10 max-h-[94vh] w-full overflow-y-auto rounded-t-3xl border-white/10 bg-[#101617]/95 p-0 shadow-2xl sm:rounded-3xl', sizes[size])}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/[0.07] bg-[#101617]/90 px-5 py-5 backdrop-blur-xl sm:px-6">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-white/45">{description}</p>}
          </div>
          <button className="rounded-lg p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white" onClick={onClose} aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        {footer && <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-white/[0.07] bg-[#101617]/90 px-5 py-4 backdrop-blur-xl sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
