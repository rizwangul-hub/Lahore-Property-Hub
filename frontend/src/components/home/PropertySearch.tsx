'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, Banknote, HelpCircle, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { PropertyPurpose } from '@/types';

export const PropertySearch: React.FC = () => {
  const router = useRouter();
  const [purpose, setPurpose] = useState<PropertyPurpose>('sale');
  const [location, setLocation] = useState<string>('lahore');
  const [propertyType, setPropertyType] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);

  // Filtered locations based on user typing
  const filteredLocations = siteConfig.locations.filter((loc) =>
    loc.label.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const selectedLocationLabel =
    siteConfig.locations.find((loc) => loc.value === location)?.label || 'All Lahore';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct clean, SEO-friendly target route
    let basePath = '/properties-for-sale/lahore';
    if (purpose === 'rent') {
      basePath = '/properties-for-rent/lahore';
    } else if (purpose === 'wanted') {
      basePath = '/property-wanted/lahore';
    }

    const params = new URLSearchParams();
    if (location && location !== 'lahore') {
      params.set('area', location);
    }
    if (propertyType && propertyType !== 'all') {
      params.set('type', propertyType);
    }
    if (minPrice) {
      params.set('minPrice', minPrice);
    }
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    }

    const queryString = params.toString();
    const targetUrl = queryString ? `${basePath}?${queryString}` : basePath;

    router.push(targetUrl);
  };

  return (
    <div className="relative z-30 -mt-16 sm:-mt-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-7 shadow-hover">
        {/* Purpose Tabs: Buy, Rent, Wanted */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 pb-4">
          <div className="inline-flex rounded-xl bg-navy-50 p-1">
            <button
              type="button"
              onClick={() => setPurpose('sale')}
              className={`rounded-lg px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                purpose === 'sale'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-navy-700 hover:text-navy-900 hover:bg-white/60'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setPurpose('rent')}
              className={`rounded-lg px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                purpose === 'rent'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-navy-700 hover:text-navy-900 hover:bg-white/60'
              }`}
            >
              Rent
            </button>
            <button
              type="button"
              onClick={() => setPurpose('wanted')}
              className={`rounded-lg px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                purpose === 'wanted'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-navy-700 hover:text-navy-900 hover:bg-white/60'
              }`}
            >
              Wanted
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-navy-500">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            Verified Lahore Societies & Locations
          </div>
        </div>

        {/* Search Filter Form */}
        <form onSubmit={handleSearch} className="mt-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Searchable Location Selector */}
            <div className="relative">
              <label
                htmlFor="search-location"
                className="block text-xs font-semibold text-navy-700 mb-1"
              >
                Location in Lahore
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <button
                  id="search-location"
                  type="button"
                  onClick={() => setIsLocationOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-3 text-left text-sm text-navy-900 transition hover:border-navy-300 focus:border-brand-500 focus:outline-none"
                >
                  <span className="truncate">{selectedLocationLabel}</span>
                  <span className="text-xs text-navy-400">&#x25BE;</span>
                </button>
              </div>

              {/* Location Dropdown Modal */}
              {isLocationOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-navy-200 bg-white p-2 shadow-hover">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search society, e.g. DHA..."
                    className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs text-navy-900 focus:border-brand-500 focus:outline-none"
                    autoFocus
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto divide-y divide-navy-50">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => (
                        <button
                          key={loc.value}
                          type="button"
                          onClick={() => {
                            setLocation(loc.value);
                            setIsLocationOpen(false);
                            setLocationQuery('');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs transition hover:bg-brand-50 hover:text-brand-700 ${
                            location === loc.value
                              ? 'bg-brand-50 font-bold text-brand-700'
                              : 'text-navy-700'
                          }`}
                        >
                          {loc.label}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-xs text-navy-400">No matching society</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div>
              <label
                htmlFor="search-property-type"
                className="block text-xs font-semibold text-navy-700 mb-1"
              >
                Property Type
              </label>
              <div className="relative">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <select
                  id="search-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-8 text-sm text-navy-900 transition hover:border-navy-300 focus:border-brand-500 focus:outline-none"
                >
                  {siteConfig.propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-navy-400">
                  &#x25BE;
                </div>
              </div>
            </div>

            {/* Price Min (PKR) */}
            <div>
              <label
                htmlFor="search-min-price"
                className="block text-xs font-semibold text-navy-700 mb-1"
              >
                Min Price (PKR)
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <select
                  id="search-min-price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-8 text-sm text-navy-900 transition hover:border-navy-300 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Any Min Price</option>
                  <option value="2500000">25 Lakh (2.5M)</option>
                  <option value="5000000">50 Lakh (5M)</option>
                  <option value="10000000">1 Crore (10M)</option>
                  <option value="20000000">2 Crore (20M)</option>
                  <option value="35000000">3.5 Crore (35M)</option>
                  <option value="50000000">5 Crore (50M)</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-navy-400">
                  &#x25BE;
                </div>
              </div>
            </div>

            {/* Price Max (PKR) */}
            <div>
              <label
                htmlFor="search-max-price"
                className="block text-xs font-semibold text-navy-700 mb-1"
              >
                Max Price (PKR)
              </label>
              <div className="relative">
                <Banknote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <select
                  id="search-max-price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-8 text-sm text-navy-900 transition hover:border-navy-300 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Any Max Price</option>
                  <option value="5000000">50 Lakh (5M)</option>
                  <option value="10000000">1 Crore (10M)</option>
                  <option value="20000000">2 Crore (20M)</option>
                  <option value="35000000">3.5 Crore (35M)</option>
                  <option value="50000000">5 Crore (50M)</option>
                  <option value="100000000">10 Crore (100M+)</option>
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-navy-400">
                  &#x25BE;
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer Action */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-navy-100 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-navy-500">
              <HelpCircle className="h-4 w-4 text-brand-600" />
              <span>Looking for quick filtering? Select society above and click search.</span>
            </div>

            <button
              type="submit"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-95"
            >
              <Search className="h-4 w-4" />
              <span>Search Properties</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
