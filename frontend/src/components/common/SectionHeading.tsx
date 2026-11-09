import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  centered = false,
  actionText,
  actionHref,
  className = '',
}) => {
  return (
    <div
      className={`mb-8 flex flex-col md:flex-row md:items-end ${
        centered ? 'text-center md:items-center justify-center' : 'justify-between'
      } gap-4 ${className}`}
    >
      <div className={centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}>
        {badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200 mb-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            {badge}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-navy-600 sm:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && actionHref && !centered && (
        <div className="shrink-0">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 transition group"
          >
            <span>{actionText}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
