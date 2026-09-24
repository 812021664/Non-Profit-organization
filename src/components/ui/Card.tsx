import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: 'emerald' | 'gold' | 'blue' | 'none';
}

export function Card({ children, className, glow = 'none', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden rounded-2xl',
        glow === 'emerald' && 'shadow-[0_22px_75px_rgba(16,185,129,.08)]',
        glow === 'gold' && 'shadow-[0_22px_75px_rgba(245,158,11,.06)]',
        glow === 'blue' && 'shadow-[0_22px_75px_rgba(14,165,233,.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0', className)} {...props}>{children}</div>;
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-base font-semibold tracking-tight text-white', className)} {...props}>{children}</h2>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props}>{children}</div>;
}
