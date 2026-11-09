import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  Home,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { PropertyCard } from '@/components/property/PropertyCard';
import { EmptyState } from '@/components/common/EmptyState';
import { siteConfig } from '@/config/site';
import { fetchProperties } from '@/lib/api';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

const CATEGORY_MAP: Record<
  string,
  {
    title: string;
    propertyType: string;
    description: string;
  }
> = {
  houses: {
    title: 'Houses for Sale & Rent in Lahore',
    propertyType: 'HOUSE',
    description:
      'Explore independent villas, designer family bungalows, and brand-new houses across Lahore. Filter by 5 Marla, 10 Marla, 1 Kanal, and 2 Kanal dimensions in DHA, Bahria Town, and Johar Town.',
  },
  apartments: {
    title: 'Apartments & Flats in Lahore',
    propertyType: 'APARTMENT',
    description:
      'Find luxury vertical apartments, studio flats, and penthouses in Lahore. Featuring modern high-rise projects in Gulberg, DHA, and central commercial avenues.',
  },
  plots: {
    title: 'Plots for Sale in Lahore',
    propertyType: 'PLOT',
    description:
      'Discover residential and commercial plots for investment across premier housing schemes in Lahore. Browse ready-to-construct plots with direct society balloting.',
  },
  shops: {
    title: 'Commercial Shops & Retail Outlets in Lahore',
    propertyType: 'SHOP',
    description:
      'Explore commercial shops, storefronts, and retail spaces in high-footfall markets across Lahore including Gulberg Main Boulevard and DHA commercial hubs.',
  },
  offices: {
    title: 'Corporate Offices in Lahore',
    propertyType: 'OFFICE',
    description:
      'Find executive office floors and corporate suites for rent and sale in Lahore’s premier commercial towers with high-speed elevators and dedicated parking.',
  },
  commercial: {
    title: 'Commercial Properties in Lahore',
    propertyType: 'COMMERCIAL_BUILDING',
    description:
      'Browse complete commercial plazas, multi-story buildings, and corporate investment properties across Lahore.',
  },
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_MAP[category.toLowerCase()];

  if (!cat) {
    return {
      title: 'Property Category | Lahore Property Hub',
      description: 'Explore properties across Lahore by category.',
    };
  }

  const title = `${cat.title} | Lahore Property Hub`;
  const canonicalUrl = `${siteConfig.url}/properties/category/${category.toLowerCase()}`;

  return {
    title,
    description: cat.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: cat.description,
      url: canonicalUrl,
      siteName: siteConfig.brandName,
      locale: 'en_PK',
      type: 'website',
      images: [siteConfig.ogImage],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORY_MAP[category.toLowerCase()];

  if (!cat) {
    notFound();
  }

  // Fetch approved properties in this category
  const { properties, total } = await fetchProperties({
    propertyType: cat.propertyType,
    limit: 12,
  });

  // Breadcrumb structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${siteConfig.url}/buy`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cat.title,
        item: `${siteConfig.url}/properties/category/${category.toLowerCase()}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="py-8 sm:py-12 bg-navy-50/50 min-h-screen">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-navy-500">
          <Link href="/" className="hover:text-brand-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/buy" className="hover:text-brand-600 transition">
            Categories
          </Link>
          <span>/</span>
          <span className="font-semibold text-navy-900 capitalize">{category}</span>
        </nav>

        {/* Category Header */}
        <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-10 shadow-card">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200 mb-3">
              <Building2 className="h-3.5 w-3.5" />
              Category Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
              {cat.title}
            </h1>
            <p className="mt-3 text-sm text-navy-700 leading-relaxed">
              {cat.description}
            </p>
          </div>

          {/* Quick Links by Lahore Area */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-navy-100 pt-5 text-xs font-semibold">
            <span className="text-navy-400 mr-1">Filter by Area:</span>
            {siteConfig.popularAreas.map((area) => (
              <Link
                key={area}
                href={`/properties-for-sale/lahore?area=${encodeURIComponent(area)}&type=${cat.propertyType.toLowerCase()}`}
                className="rounded-lg border border-navy-200 bg-navy-50 px-3 py-1.5 text-navy-800 hover:border-brand-500 hover:text-brand-700 transition"
              >
                {area}
              </Link>
            ))}
          </div>
        </div>

        {/* Listings Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-navy-950">
              Active Listings ({total})
            </h2>
            <Link
              href={`/properties-for-sale/lahore?type=${cat.propertyType.toLowerCase()}`}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 transition"
            >
              Open in Advanced Filter Search &rarr;
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Home}
              title={`No ${category} currently listed`}
              description={`We do not have active approved listings for ${category} at this moment. Submit your listing to feature it at the top.`}
              actionText="Post Your Listing"
              actionHref="/post-property"
            />
          )}
        </div>
      </Container>
    </div>
    </>
  );
}
