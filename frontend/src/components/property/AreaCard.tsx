import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';
import { AreaItem } from '@/types';

export interface AreaCardProps {
  area: AreaItem;
}

export const AreaCard: React.FC<AreaCardProps> = ({ area }) => {
  return (
    <Link
      href={`/properties/${area.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand-200"
    >
      {/* Area Image */}
      <div className="relative h-44 w-full overflow-hidden bg-navy-100">
        <Image
          src={area.image}
          alt={`${area.name}, ${area.city}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
        
        {/* City tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white/90">
          <MapPin className="h-3.5 w-3.5 text-brand-400" />
          <span>{area.city}</span>
        </div>
      </div>

      {/* Area Details */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
            {area.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-navy-600 leading-relaxed">
            {area.tagline}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3 text-xs font-semibold text-brand-700 group-hover:text-brand-800">
          <span>View Properties</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};
