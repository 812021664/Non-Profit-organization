import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-7 flex animate-fade-up flex-col justify-between gap-4 md:mb-9 md:flex-row md:items-end">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/45 sm:text-[15px]">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  );
}
