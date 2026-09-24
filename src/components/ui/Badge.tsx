import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const tones: Record<BadgeTone, string> = {
  success: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300',
  warning: 'border-amber-400/15 bg-amber-400/10 text-amber-200',
  danger: 'border-red-400/15 bg-red-400/10 text-red-200',
  info: 'border-sky-400/15 bg-sky-400/10 text-sky-200',
  neutral: 'border-white/10 bg-white/[0.055] text-white/55',
  purple: 'border-violet-400/15 bg-violet-400/10 text-violet-200',
};

export function Badge({ tone = 'neutral', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]', tones[tone], className)}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}
