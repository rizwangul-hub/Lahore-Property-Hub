import React from 'react';
import Link from 'next/link';
import {
  Home,
  Building,
  Map,
  Store,
  Briefcase,
  Landmark,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { CategoryItem } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Building,
  Map,
  Store,
  Briefcase,
  Landmark,
};

export interface CategoryCardProps {
  category: CategoryItem;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const IconComponent = ICON_MAP[category.iconName] || Home;

  return (
    <Link
      href={category.href}
      className="group flex flex-col justify-between rounded-2xl border border-navy-100 bg-white p-5 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand-200"
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <IconComponent className="h-6 w-6" />
        </div>

        <h3 className="mt-4 text-base font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
          {category.title}
        </h3>

        <p className="mt-1.5 text-xs text-navy-600 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-navy-50 pt-3 text-xs font-semibold text-brand-700 group-hover:text-brand-800">
        <span>Browse {category.title}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
};
