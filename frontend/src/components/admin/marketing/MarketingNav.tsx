'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Send,
  Sparkles,
  BarChart3,
} from 'lucide-react';

interface MarketingNavProps {
  pendingCount?: number;
  approvedCount?: number;
}

export default function MarketingNav({ pendingCount = 0, approvedCount = 0 }: MarketingNavProps) {
  const pathname = usePathname();

  const links = [
    {
      label: 'Overview',
      href: '/admin/marketing',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: 'Facebook Groups',
      href: '/admin/marketing/groups',
      icon: Users,
    },
    {
      label: 'Approval Queue',
      href: '/admin/marketing/queue',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      label: 'Daily Planner',
      href: '/admin/marketing/planner',
      icon: Calendar,
    },
    {
      label: 'Publishing Workspace',
      href: '/admin/marketing/publishing',
      icon: Send,
      badge: approvedCount > 0 ? approvedCount : undefined,
      badgeColor: 'bg-brand-600 text-white',
    },
    {
      label: 'Campaign Analytics',
      href: '/admin/marketing/analytics',
      icon: BarChart3,
    },
  ];

  return (
    <div className="bg-white border border-navy-100 rounded-2xl shadow-subtle p-2 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-navy-950 text-white shadow-sm'
                    : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-navy-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          <span>Dual-Engine AI Marketing Active</span>
        </div>
      </div>
    </div>
  );
}
