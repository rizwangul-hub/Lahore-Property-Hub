import React from 'react';
import Link from 'next/link';
import { Sparkles, PlusCircle, Database, Layers } from 'lucide-react';

export const FeaturedPropertiesPlaceholder: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              Featured Opportunities
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-navy-900">
              Featured Properties in Lahore
            </h2>
            <p className="mt-1 text-sm text-navy-600">
              Hand-picked and verified residential & commercial listings across Lahore.
            </p>
          </div>
        </div>

        {/* Empty State / Structured Placeholder Container */}
        <div className="rounded-2xl border-2 border-dashed border-navy-200 bg-navy-50/50 p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100">
            <Layers className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-navy-900">
            Featured Listings Database Section
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-navy-600 leading-relaxed">
            Real property cards with live photos, pricing in PKR, society details, and direct
            WhatsApp chat buttons will populate here dynamically from the MongoDB database in Phase 2.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/post-property"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              Post the First Listing
            </Link>
            <div className="inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-xs font-medium text-navy-600">
              <Database className="h-3.5 w-3.5 text-brand-600" />
              <span>Awaiting Backend Data Integration</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
