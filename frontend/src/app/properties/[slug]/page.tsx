import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  ArrowLeft,
  Building2,
  Home,
  KeyRound,
  FileText,
  SlidersHorizontal,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { EmptyState } from '@/components/common/EmptyState';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LAHORE_AREAS, siteConfig } from '@/config/site';
import { fetchProperties } from '@/lib/api';

interface LocationLandingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const LOCATION_DETAILED_INFO: Record<
  string,
  {
    title: string;
    description: string;
    highlights: string[];
  }
> = {
  'bahria-town-lahore': {
    title: 'Bahria Town Lahore Properties',
    description:
      'Bahria Town Lahore is a world-class master-planned gated community situated along Canal Bank Road. Divided into Sectors A through F, it is renowned for its iconic Grand Jamia Mosque, Eiffel Tower replica, manicured theme parks, wide road networks, underground utilities, and uninterrupted power supply.',
    highlights: [
      'Gated community with 24/7 private security',
      'Underground cabling & independent grid supply',
      'Sectors A to F offering 5 Marla, 10 Marla & 1 Kanal homes',
      'Active commercial avenues & Safari Mall',
    ],
  },
  'dha-defence-lahore': {
    title: 'DHA Defence Lahore Properties',
    description:
      'Defence Housing Authority (DHA) Lahore is widely regarded as the gold standard of real estate in Pakistan. Spanning established Phases 1 through 5 and modern expanding Phases 6, 7, 8, 9, and Prism 9, DHA delivers elite residential serenity alongside bustling Commercial Broadways and sports complexes.',
    highlights: [
      'Premier security, LDA & DHA administrative standards',
      'Phases 1-9 & Prism 9 connecting Ring Road & Airport',
      'State-of-the-art sports clubs, parks, and hospital campuses',
      'High-yield commercial plazas & luxury designer bungalows',
    ],
  },
  'gulberg-lahore': {
    title: 'Gulberg Lahore Properties',
    description:
      'Centrally positioned between Mall Road, Ferozepur Road, and Jail Road, Gulberg is Lahore’s primary financial and luxury commercial hub. From Main Boulevard and MM Alam Road to Gulberg II & III, the area is experiencing a rapid high-rise vertical transformation with premier penthouses and corporate towers.',
    highlights: [
      'Lahore’s primary commercial & financial corridor',
      'Famous MM Alam Road dining and designer retail',
      'Modern luxury vertical apartment towers & penthouses',
      'Central connectivity to all major arterial roads',
    ],
  },
  'johar-town-lahore': {
    title: 'Johar Town Lahore Properties',
    description:
      'Johar Town is one of the most vibrant and centrally accessible residential schemes in southwestern Lahore. Home to the landmark Emporium Mall, Expo Centre Lahore, Shaukat Khanum Memorial Cancer Hospital, and top universities, Johar Town represents ideal family living.',
    highlights: [
      'Proximity to Emporium Mall & Expo Centre Lahore',
      'Established Blocks A through R with parks and markets',
      'Premier medical & educational institutions nearby',
      'Direct access to Canal Road and Khayaban-e-Firdousi',
    ],
  },
  'wapda-town-lahore': {
    title: 'Wapda Town Lahore Properties',
    description:
      'Wapda Town is a mature, well-organized residential society situated between Johar Town and Valencia. Known for its wide streets, community parks, vibrant roundabouts, and reputable educational centers, it offers affordable luxury family living.',
    highlights: [
      'Established Phases 1 and 2 with complete utility provisions',
      'Excellent neighborhood markets and round-the-clock security',
      'Fast access to Raiwind Road, Khayaban-e-Jinnah, and Ring Road',
      'Ideal for 5 Marla and 10 Marla family residences',
    ],
  },
  'model-town-lahore': {
    title: 'Model Town Lahore Properties',
    description:
      'Designed in the early 20th century as a garden town, Model Town is a historic, lush, elite cooperative housing society. Arranged in circular concentric blocks surrounding the vast Model Town Park, it provides an unmatched combination of old-world charm and modern convenience.',
    highlights: [
      'Historic garden town design with mature trees and large parks',
      'Blocks A through J with strict cooperative society bylaws',
      'Model Town Central Commercial Market & Bank Square',
      'Central location between Ferozepur Road and Garden Town',
    ],
  },
  'raiwind-road-lahore': {
    title: 'Raiwind Road Lahore Properties',
    description:
      'Raiwind Road is Lahore’s most rapidly growing southern development corridor. Extending from Thokar Niaz Baig towards Raiwind, this major artery is flanked by prestigious lifestyle housing developments including Lake City, Fazaia Housing, Bahria Orchard, and university campuses.',
    highlights: [
      'Fastest expanding residential corridor in southern Lahore',
      'Direct link to Lahore Ring Road interchange',
      'Home to Lake City, Bahria Orchard, and superior education campuses',
      'Wide price ranges for new investors and home builders',
    ],
  },
  'valencia-town-lahore': {
    title: 'Valencia Town Lahore Properties',
    description:
      'Valencia Town is a premier gated cooperative housing society located along Defense Road and Pine Avenue in southern Lahore. Known for its wide manicured green belts, community centers, sports facilities, high security, and reputable schools like Beaconhouse and The City School.',
    highlights: [
      'Gated, secure, and established residential society',
      'Direct access to Defense Road, Pine Avenue, and Ring Road',
      'Top-tier educational institutions and healthcare within the society',
      'Broad avenues with 5 Marla, 10 Marla, 1 Kanal, and 2 Kanal houses',
    ],
  },
  'askari-lahore': {
    title: 'Askari Lahore Properties',
    description:
      'Askari Housing Schemes (Askari 1 through Askari 11) represent elite, highly organized living in Lahore managed by the Army Welfare Trust. Famed for supreme perimeter security, underground services, beautifully landscaped parks, and spotless residential discipline.',
    highlights: [
      'Supreme gated security with strictly controlled resident and visitor checkpoints',
      'Prime sectors across Cantt, Bedian Road, and Ring Road interchanges',
      'Flawless civic maintenance and uninterrupted backup power options',
      'Luxury high-rise apartments and custom-designed independent villas',
    ],
  },
  'lake-city-lahore': {
    title: 'Lake City Lahore Properties',
    description:
      'Lake City Lahore is a premier golf and lifestyle resort community located on Main Raiwind Road with its own dedicated Lahore Ring Road interchange. Boasting an 18-hole championship golf course, international schools, Lake City Mall, Cinepax, and tranquil lakes.',
    highlights: [
      'Championship 18-hole golf course and country club lifestyle',
      'Direct Ring Road interchange providing 15-minute access to DHA and Airport',
      'Lake City Mall, family entertainment zones, and retail outlets',
      'Sectors M1 through M8 with ready-to-move designer houses and plots',
    ],
  },
  'maraka-lahore': {
    title: 'Maraka Lahore Properties',
    description:
      'Maraka is a rapidly expanding suburban and farmhouse residential zone situated along Multan Road and Canal Bank near Chung and Thokar Niaz Baig. Ideal for affordable land investments, spacious country farmhouses, and commercial warehouse logistics.',
    highlights: [
      'Strategic suburban location on Main Multan Road near Thokar Niaz Baig',
      'High appreciation potential for affordable residential plots',
      'Ideal destination for luxury private farmhouses and green estates',
      'Direct connectivity to Motorway M-2 and provincial transportation routes',
    ],
  },
  'lahore-cantt': {
    title: 'Lahore Cantt Properties',
    description:
      'Lahore Cantonment represents an elite, secure, and historic locality characterized by broad avenues, army-managed civic facilities, and peaceful residential neighborhoods. Neighborhoods like Saddar, Cavalry Ground, and Sarwar Road offer prestigious living.',
    highlights: [
      'Highest level of civic discipline and security monitoring',
      'Saddar, Cavalry Ground, and Sarwar Road neighborhoods',
      'Minutes from Allama Iqbal International Airport',
      'Prestigious traditional bungalows and modern residences',
    ],
  },
};

/**
 * Dynamic SEO Metadata for Location Landing Pages (Section 7 & 9)
 */
export async function generateMetadata({
  params,
}: LocationLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = LAHORE_AREAS.find((a) => a.slug === slug);
  const areaName = area
    ? area.name
    : slug.replace(/-lahore$/, '').replace(/-/g, ' ');

  const title = `Properties in ${areaName}, Lahore | Lahore Property Hub`;
  const description = `Find verified houses, plots, apartments, and commercial properties for rent and sale in ${areaName}, Lahore. Explore societies, pricing, and direct WhatsApp contact.`;
  const canonicalUrl = `${siteConfig.url}/properties/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'en_PK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocationLandingPage({
  params,
}: LocationLandingPageProps) {
  const { slug } = await params;
  const areaMeta = LAHORE_AREAS.find((a) => a.slug === slug);

  const areaName = areaMeta
    ? areaMeta.name
    : slug
        .replace(/-lahore$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

  const locationInfo = LOCATION_DETAILED_INFO[slug] || {
    title: `Properties in ${areaName}, Lahore`,
    description: `Discover verified residential houses, commercial buildings, plots, and apartments located throughout ${areaName}, Lahore. Connect directly with authentic owners and local dealers.`,
    highlights: [
      'Prime residential and commercial opportunities',
      'Direct WhatsApp connection with sellers',
      'No middleman charges for browsing',
      'Close to major Lahore transportation corridors',
    ],
  };

  // Fetch approved properties in this area from the real API
  const { properties, total } = await fetchProperties({ area: areaName, limit: 12 });

  // Other related Lahore areas
  const relatedAreas = LAHORE_AREAS.filter((a) => a.slug !== slug).slice(0, 4);

  // Structured Data Schema (Section 10)
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
        name: 'Lahore Locations',
        item: `${siteConfig.url}/locations`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: areaName,
        item: `${siteConfig.url}/properties/${slug}`,
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
            <Link href="/locations" className="hover:text-brand-600 transition">
              Locations
            </Link>
            <span>/</span>
            <span className="font-semibold text-navy-900">{areaName}</span>
          </nav>

          {/* Location Hero Header */}
          <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-10 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200 mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  Lahore Prime Society
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
                  {locationInfo.title}
                </h1>

                <p className="mt-3 text-sm text-navy-700 leading-relaxed">
                  {locationInfo.description}
                </p>

                {/* Highlights */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-navy-700">
                  {locationInfo.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Purpose Action Card */}
              <div className="shrink-0 flex flex-col gap-2.5 sm:w-64 border-t md:border-t-0 md:border-l border-navy-100 pt-4 md:pt-0 md:pl-6">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-400">
                  Quick Filter Actions
                </span>
                <Link
                  href={`/properties-for-sale/lahore?area=${encodeURIComponent(areaName)}`}
                  className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
                >
                  <span>Properties for Sale</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/properties-for-rent/lahore?area=${encodeURIComponent(areaName)}`}
                  className="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-semibold text-navy-800 hover:bg-navy-50 transition"
                >
                  <span>Properties for Rent</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/property-wanted/lahore?area=${encodeURIComponent(areaName)}`}
                  className="flex items-center justify-between rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-semibold text-navy-800 hover:bg-navy-50 transition"
                >
                  <span>Buyer Wanted Demands</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Category Deep Links Section */}
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="text-navy-400 mr-1">Popular in {areaName}:</span>
            {['House', 'Apartment', 'Plot', 'Commercial'].map((cat) => (
              <Link
                key={cat}
                href={`/properties-for-sale/lahore?area=${encodeURIComponent(areaName)}&type=${cat.toLowerCase()}`}
                className="rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-navy-700 hover:border-brand-500 hover:text-brand-700 transition shadow-subtle"
              >
                {cat}s in {areaName}
              </Link>
            ))}
          </div>

          {/* Approved Properties Grid */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Real Estate Listings
                </span>
                <h2 className="text-2xl font-bold text-navy-950">
                  Available Listings in {areaName}
                </h2>
              </div>
              <span className="text-xs font-semibold text-navy-500">
                {total} Approved Listing(s)
              </span>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title={`No listings available in ${areaName} yet`}
                description={`Our marketplace is awaiting submissions for ${areaName}. Be the first owner or realtor to feature your house, plot, or apartment here.`}
                actionText={`Post Property in ${areaName}`}
                actionHref="/post-property"
              />
            )}
          </div>

          {/* Related Lahore Locations Section (Section 7.6) */}
          <div className="mt-16 border-t border-navy-200 pt-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950 mb-4">
              Explore Neighboring Lahore Societies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedAreas.map((ra) => (
                <Link
                  key={ra.slug}
                  href={`/properties/${ra.slug}`}
                  className="rounded-2xl border border-navy-100 bg-white p-4 shadow-subtle hover:shadow-card hover:border-brand-300 transition group"
                >
                  <h4 className="font-bold text-sm text-navy-900 group-hover:text-brand-600 transition">
                    {ra.name}
                  </h4>
                  <p className="mt-1 text-xs text-navy-500 line-clamp-1">{ra.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
