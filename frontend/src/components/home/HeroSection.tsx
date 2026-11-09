'use client';

import React, { useState } from 'react';
import { Search, MapPin, Home, Banknote, Shield, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const HeroSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent'>('buy');
  const [selectedArea, setSelectedArea] = useState('');
  const [propertyType, setPropertyType] = useState('');

  return (
    <section className="relative bg-gradient-to-b from-navy-50 to-white py-16 md:py-24 border-b border-navy-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-semibold text-brand-800 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
            Dedicated Real Estate Marketplace for Lahore
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-5xl sm:leading-tight">
            Find Your Next Property in{' '}
            <span className="text-brand-600 underline decoration-brand-300 decoration-4 underline-offset-4">
              Lahore
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-navy-600 leading-relaxed">
            Discover verified houses, apartments, plots, and commercial properties for rent and sale
            across Lahore societies. Connect directly with owners & dealers via WhatsApp.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white p-4 sm:p-6 shadow-card border border-navy-100">
          {/* Buy / Rent Tabs */}
          <div className="flex gap-2 border-b border-navy-100 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab('buy')}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                activeTab === 'buy'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              }`}
            >
              Buy Property
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rent')}
              className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition ${
                activeTab === 'rent'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              }`}
            >
              Rent Property
            </button>
          </div>

          {/* Search Inputs */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Area / Society input */}
            <div className="relative">
              <label htmlFor="area-select" className="block text-xs font-semibold text-navy-700 mb-1">
                Area or Society
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <select
                  id="area-select"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-navy-200 bg-white py-2.5 pl-10 pr-8 text-sm text-navy-800 transition focus:border-brand-500 focus:outline-none"
                >
                  <option value="">All Lahore Locations</option>
                  {siteConfig.popularAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Type */}
            <div className="relative">
              <label htmlFor="type-select" className="block text-xs font-semibold text-navy-700 mb-1">
                Property Type
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <select
                  id="type-select"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-navy-200 bg-white py-2.5 pl-10 pr-8 text-sm text-navy-800 transition focus:border-brand-500 focus:outline-none"
                >
                  <option value="">All Types (House, Plot, Flat...)</option>
                  {siteConfig.propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range Filter Placeholder */}
            <div className="relative">
              <label htmlFor="budget-select" className="block text-xs font-semibold text-navy-700 mb-1">
                Budget Range (PKR)
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <select
                  id="budget-select"
                  className="w-full appearance-none rounded-lg border border-navy-200 bg-white py-2.5 pl-10 pr-8 text-sm text-navy-800 transition focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Any Budget</option>
                  <option value="under-5m">Under 50 Lakh (5M)</option>
                  <option value="5m-15m">50 Lakh – 1.5 Crore</option>
                  <option value="15m-30m">1.5 Crore – 3 Crore</option>
                  <option value="30m-plus">3 Crore & Above</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Search Button */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95"
            >
              <Search className="h-4 w-4" />
              Search Properties
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 border border-navy-100 shadow-subtle">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-900">Direct WhatsApp</p>
              <p className="text-[11px] text-navy-500">Contact owners & realtors directly</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 border border-navy-100 shadow-subtle">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-900">Lahore Societies</p>
              <p className="text-[11px] text-navy-500">DHA, Bahria, Gulberg & more</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white p-3.5 border border-navy-100 shadow-subtle">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-900">Free to Browse</p>
              <p className="text-[11px] text-navy-500">No account required to explore</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
