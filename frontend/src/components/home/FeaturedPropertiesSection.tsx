'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { PropertyCard } from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { PropertyListing } from '@/types';
import { fetchProperties } from '@/lib/api';

export const FeaturedPropertiesSection: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchProperties({ featured: true, limit: 4 });
      setFeaturedProperties(res.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-navy-100">
      <Container>
        <SectionHeading
          badge="Featured Opportunities"
          title="Featured Properties in Lahore"
          subtitle="Hand-picked residential and commercial opportunities across Lahore societies with prime locations and high investment appeal."
          actionText="View All Properties"
          actionHref="/properties-for-sale/lahore"
        />

        {/* Loading State */}
        {isLoading && <LoadingState count={4} />}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
            <h3 className="font-bold text-sm">Unable to load featured properties</h3>
            <p className="mt-1 text-xs">{error}</p>
            <button
              type="button"
              onClick={loadProperties}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State — Strictly no fake properties */}
        {!isLoading && !error && featuredProperties.length === 0 && (
          <EmptyState
            icon={Layers}
            title="No featured properties available yet."
            description="Our database is currently awaiting property submissions. Be among the first to feature your Lahore house, plot, or commercial property to thousands of prospective buyers."
            actionText="Post Your Property Now"
            actionHref="/post-property"
          />
        )}

        {/* Dynamic Property Grid (Active when properties exist) */}
        {!isLoading && !error && featuredProperties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};
