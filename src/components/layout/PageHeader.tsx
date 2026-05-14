import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

function hasThai(value: string) {
  return /[\u0E00-\u0E7F]/.test(value);
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const titleIsThai = hasThai(title);
  const subtitleIsThai = subtitle ? hasThai(subtitle) : false;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className={titleIsThai ? 'text-page-title-th' : 'text-page-title'}>{title}</h1>
        {subtitle ? <p className={`mt-2 max-w-3xl ${subtitleIsThai ? 'text-page-subtitle-th' : 'text-page-subtitle'}`}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
