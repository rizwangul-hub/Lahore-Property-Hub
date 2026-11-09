import React from 'react';
import Link from 'next/link';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-navy-200 bg-white/70 p-8 sm:p-12 text-center shadow-subtle ${className}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-navy-600 leading-relaxed">
        {description}
      </p>

      {(actionText && actionHref) || (actionText && onAction) ? (
        <div className="mt-6 flex justify-center">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="md">
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
};
