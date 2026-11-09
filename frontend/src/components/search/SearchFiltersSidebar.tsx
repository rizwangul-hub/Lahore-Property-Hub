'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Filter,
  X,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  Building,
  MapPin,
  Banknote,
  Maximize2,
  Bed,
  Bath,
  Sparkles,
} from 'lucide-react';
import { siteConfig } from '@/config/site';

const FACILITIES = [
  'Gas',
  'Electricity',
  'Water',
  'Parking',
  'Security',
  'Internet',
  'Lift',
  'Nearby school',
  'Nearby hospital',
  'Furnished',
];

export interface SearchFiltersSidebarProps {
  currentPurpose: 'SALE' | 'RENT' | 'WANTED';
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

export const SearchFiltersSidebar: React.FC<SearchFiltersSidebarProps> = ({
  currentPurpose,
  isMobileModal = false,
  onCloseMobile,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current query values
  const area = searchParams.get('area') || '';
  const type = searchParams.get('type') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minAreaSize = searchParams.get('minAreaSize') || '';
  const maxAreaSize = searchParams.get('maxAreaSize') || '';
  const areaUnit = searchParams.get('areaUnit') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const sort = searchParams.get('sort') || 'newest';
  const facilitiesParam = searchParams.get('facilities') || '';
  const activeFacilities = facilitiesParam ? facilitiesParam.split(',') : [];

  const isResidential = !type || ['house', 'apartment', 'HOUSE', 'APARTMENT'].includes(type);

  // Helper to update a single or multiple query parameters in the URL
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset page to 1 whenever filters change
    params.delete('page');

    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  };

  const handlePurposeSwitch = (newPurpose: 'SALE' | 'RENT' | 'WANTED') => {
    let targetBase = '/properties-for-sale/lahore';
    if (newPurpose === 'RENT') targetBase = '/properties-for-rent/lahore';
    if (newPurpose === 'WANTED') targetBase = '/property-wanted/lahore';

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const qs = params.toString();
    router.push(`${targetBase}${qs ? `?${qs}` : ''}`);
    if (onCloseMobile) onCloseMobile();
  };

  const toggleFacility = (facilityName: string) => {
    let newFacs: string[];
    if (activeFacilities.includes(facilityName)) {
      newFacs = activeFacilities.filter((f) => f !== facilityName);
    } else {
      newFacs = [...activeFacilities, facilityName];
    }
    updateQuery({ facilities: newFacs.length > 0 ? newFacs.join(',') : null });
  };

  const handleClearAll = () => {
    router.push(pathname);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className={`space-y-6 ${isMobileModal ? 'p-6' : 'rounded-3xl border border-navy-100 bg-white p-6 shadow-subtle'}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-navy-100 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
            Advanced Filters
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-brand-600 transition"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          {isMobileModal && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-navy-400 hover:text-navy-900"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Purpose Switcher Tabs */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-1.5">
          Advertisement Objective
        </label>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-navy-50 p-1 border border-navy-200">
          <button
            type="button"
            onClick={() => handlePurposeSwitch('SALE')}
            className={`rounded-lg py-2 text-xs font-bold transition ${
              currentPurpose === 'SALE'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            For Sale
          </button>
          <button
            type="button"
            onClick={() => handlePurposeSwitch('RENT')}
            className={`rounded-lg py-2 text-xs font-bold transition ${
              currentPurpose === 'RENT'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            For Rent
          </button>
          <button
            type="button"
            onClick={() => handlePurposeSwitch('WANTED')}
            className={`rounded-lg py-2 text-xs font-bold transition ${
              currentPurpose === 'WANTED'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            Wanted
          </button>
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-1.5">
          Lahore Area or Society
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
          <select
            value={area}
            onChange={(e) => updateQuery({ area: e.target.value || null })}
            className="w-full appearance-none rounded-xl border border-navy-200 bg-white py-2 pl-9 pr-8 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Lahore Locations</option>
            {siteConfig.locations.filter((l) => l.value !== 'lahore').map((loc) => (
              <option key={loc.value} value={loc.label}>
                {loc.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-400" />
        </div>
      </div>

      {/* Property Category */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-1.5">
          Property Type
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
          <select
            value={type.toLowerCase()}
            onChange={(e) => updateQuery({ type: e.target.value || null })}
            className="w-full appearance-none rounded-xl border border-navy-200 bg-white py-2 pl-9 pr-8 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="house">House / Villa</option>
            <option value="apartment">Apartment / Flat</option>
            <option value="plot">Plot</option>
            <option value="shop">Shop / Retail</option>
            <option value="office">Office</option>
            <option value="commercial-building">Commercial Building</option>
            <option value="warehouse">Warehouse</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-navy-400" />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-1.5">
          Price Range (PKR)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => updateQuery({ minPrice: e.target.value || null })}
            placeholder="Min Price"
            className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => updateQuery({ maxPrice: e.target.value || null })}
            placeholder="Max Price"
            className="w-full rounded-xl border border-navy-200 px-3 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Area Size */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-1.5">
          Area Size & Unit
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={minAreaSize}
            onChange={(e) => updateQuery({ minAreaSize: e.target.value || null })}
            placeholder="Min"
            className="w-full rounded-xl border border-navy-200 px-2.5 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          />
          <input
            type="number"
            value={maxAreaSize}
            onChange={(e) => updateQuery({ maxAreaSize: e.target.value || null })}
            placeholder="Max"
            className="w-full rounded-xl border border-navy-200 px-2.5 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          />
          <select
            value={areaUnit}
            onChange={(e) => updateQuery({ areaUnit: e.target.value || null })}
            className="w-full rounded-xl border border-navy-200 px-2 py-2 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">Unit</option>
            <option value="MARLA">Marla</option>
            <option value="KANAL">Kanal</option>
            <option value="SQ_FT">Sq Ft</option>
            <option value="SQ_YD">Sq Yd</option>
          </select>
        </div>
      </div>

      {/* Contextual Bedrooms & Bathrooms (Only for residential categories) */}
      {isResidential && (
        <div className="space-y-4 border-t border-navy-100 pt-4">
          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1.5">
              Minimum Bedrooms
            </label>
            <div className="flex gap-1.5">
              {['', '1', '2', '3', '4', '5'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => updateQuery({ bedrooms: b || null })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                    bedrooms === b
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-navy-200 text-navy-600 hover:bg-navy-50'
                  }`}
                >
                  {b ? `${b}+` : 'Any'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1.5">
              Minimum Bathrooms
            </label>
            <div className="flex gap-1.5">
              {['', '1', '2', '3', '4'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => updateQuery({ bathrooms: b || null })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                    bathrooms === b
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-navy-200 text-navy-600 hover:bg-navy-50'
                  }`}
                >
                  {b ? `${b}+` : 'Any'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Facilities & Utilities */}
      <div className="border-t border-navy-100 pt-4">
        <label className="block text-xs font-semibold text-navy-700 mb-2">
          Utilities & Amenities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FACILITIES.map((f) => {
            const isChecked = activeFacilities.includes(f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFacility(f)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold text-left transition ${
                  isChecked
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-navy-100 hover:border-navy-200 text-navy-700 bg-white'
                }`}
              >
                <div
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    isChecked ? 'border-brand-600 bg-brand-600 text-white' : 'border-navy-300'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span className="truncate">{f}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
