import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { PropertyListing } from '@/types';

export interface PropertyCardProps {
  property: PropertyListing;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formattedPrice = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand-200">
      {/* Property Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-navy-100">
        <Image
          src={
            property.images && property.images.length > 0
              ? property.images[0]
              : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
          }
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent opacity-70" />

        {/* Badges Top Left & Top Right */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm ${
              property.purpose === 'sale'
                ? 'bg-brand-600'
                : property.purpose === 'rent'
                ? 'bg-blue-600'
                : 'bg-amber-600'
            }`}
          >
            {property.purpose === 'sale' ? 'For Sale' : property.purpose === 'rent' ? 'For Rent' : 'Wanted'}
          </span>
          {property.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>

        {/* Category tag */}
        <div className="absolute top-3 right-3">
          <span className="rounded-md bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-navy-800 capitalize shadow-sm">
            {property.category}
          </span>
        </div>

        {/* Price overlay at bottom */}
        <div className="absolute bottom-3 left-3 text-white">
          <span className="text-xs font-medium text-white/80">PKR</span>
          <span className="ml-1 text-lg font-extrabold sm:text-xl tracking-tight">
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-navy-950 group-hover:text-brand-600 transition-colors">
            {property.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-navy-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
            <span className="truncate">
              {property.location.area}, {property.location.city}
            </span>
          </div>

          {/* Key Specs (Size, Beds, Baths) */}
          <div className="mt-4 flex items-center gap-4 border-t border-navy-100 pt-3 text-xs text-navy-600">
            <div className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-navy-400" />
              <span className="font-semibold text-navy-800">{property.areaSize}</span>
            </div>
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5 text-navy-400" />
                <span className="font-semibold text-navy-800">{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-navy-400" />
                <span className="font-semibold text-navy-800">{property.bathrooms} Baths</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2 border-t border-navy-100 pt-3.5">
          <Link
            href={`/property/${property.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-navy-200 bg-white py-2 px-3 text-xs font-semibold text-navy-800 transition hover:bg-navy-50 hover:border-navy-300"
          >
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {property.whatsappContact && (
            <a
              href={`https://wa.me/${property.whatsappContact}?text=I am interested in ${encodeURIComponent(
                property.title
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
              aria-label="Contact on WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
