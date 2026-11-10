import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  ArrowLeft,
  Maximize2,
  Bed,
  Bath,
  Layers,
  Sparkles,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Shield,
  FileText,
  Building2,
  Share2,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyEnquirySection } from '@/components/property/PropertyEnquirySection';
import { fetchPropertyBySlug, fetchSimilarProperties } from '@/lib/api';
import { siteConfig } from '@/config/site';

interface PropertyDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Dynamic SEO Metadata Generation (Section 9)
 */
export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await fetchPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found | Property in Lahore',
      description: 'The requested property could not be found or has been unlisted.',
    };
  }

  const pageTitle = `${property.title} | Property in Lahore`;
  const metaDescription = `Explore this ${property.areaSize} ${property.category} for ${property.purpose} in ${property.location.area}, Lahore. Check property specifications, price, facilities, authentic photos, and contact directly via WhatsApp.`;
  const canonicalUrl = `${siteConfig.url}/property/${property.slug}`;
  const ogImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title: pageTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: siteConfig.brandName,
      locale: 'en_PK',
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await fetchPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const similarProperties = await fetchSimilarProperties(slug);

  const formattedPrice = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(property.price);

  const formattedDate = new Date(property.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isWanted = property.purpose === 'wanted';

  // JSON-LD Structured Data Schema (Section 10)
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
        name: `${property.location.city}`,
        item: `${siteConfig.url}/properties-for-${property.purpose === 'rent' ? 'rent' : 'sale'}/lahore`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.location.area,
        item: `${siteConfig.url}/properties-for-${property.purpose === 'rent' ? 'rent' : 'sale'}/lahore?area=${encodeURIComponent(property.location.area)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: property.title,
        item: `${siteConfig.url}/property/${property.slug}`,
      },
    ],
  };

  const realEstateSchema = !isWanted
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.title,
        description: property.description,
        url: `${siteConfig.url}/property/${property.slug}`,
        image: property.images,
        datePosted: property.createdAt,
        offers: {
          '@type': 'Offer',
          price: property.price,
          priceCurrency: property.currency || 'PKR',
          businessFunction:
            property.purpose === 'rent'
              ? 'http://purl.org/goodrelations/v1#LeaseOut'
              : 'http://purl.org/goodrelations/v1#Sell',
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: property.location.area,
          addressRegion: property.location.city,
          addressCountry: 'PK',
        },
      }
    : null;

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {realEstateSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(realEstateSchema) }}
        />
      )}

      <div className="py-8 sm:py-12 bg-navy-50/50 min-h-screen">
        <Container>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-navy-500">
            <Link href="/" className="hover:text-brand-600 transition">
              Home
            </Link>
            <span>/</span>
            <Link
              href={isWanted ? '/property-wanted/lahore' : `/properties-for-${property.purpose}/lahore`}
              className="hover:text-brand-600 transition capitalize"
            >
              {isWanted ? 'Property Wanted' : `Properties for ${property.purpose}`}
            </Link>
            <span>/</span>
            <Link
              href={`/properties-for-sale/lahore?area=${encodeURIComponent(property.location.area)}`}
              className="hover:text-brand-600 transition"
            >
              {property.location.area}
            </Link>
            <span>/</span>
            <span className="font-semibold text-navy-900 truncate max-w-xs">{property.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery (Available Properties only) */}
              {!isWanted && (
                <PropertyGallery images={property.images} title={property.title} />
              )}

              {/* WANTED Property Special Banner Layout */}
              {isWanted && (
                <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 shadow-subtle">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 mb-3">
                    <FileText className="h-3.5 w-3.5" />
                    Buyer / Tenant Requirement
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                    {property.title}
                  </h1>
                  <p className="mt-2 text-xs text-navy-600">
                    This requirement was published directly by an interested property seeker in Lahore.
                  </p>
                </div>
              )}

              {/* Title & Core Overview Card */}
              <div className="rounded-3xl border border-navy-100 bg-white p-6 sm:p-8 shadow-subtle">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {property.location.area}, {property.location.city}
                      {property.location.society ? ` (${property.location.society})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-navy-100 px-2.5 py-1 text-xs font-bold uppercase text-navy-800">
                      {property.category}
                    </span>
                    {property.referenceId && (
                      <span className="font-mono text-xs font-bold text-navy-500 border border-navy-200 px-2 py-0.5 rounded-lg">
                        {property.referenceId}
                      </span>
                    )}
                  </div>
                </div>

                {!isWanted && (
                  <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
                    {property.title}
                  </h1>
                )}

                {property.location.address && (
                  <p className="mt-1 text-xs text-navy-500">{property.location.address}</p>
                )}

                {/* Key Specifications Grid */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-navy-100 py-4 text-xs text-navy-700">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-brand-600 shrink-0" />
                    <div>
                      <span className="block font-bold text-navy-900">{property.areaSize}</span>
                      <span className="text-[11px] text-navy-500">Area Size</span>
                    </div>
                  </div>

                  {property.bedrooms !== undefined && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-brand-600 shrink-0" />
                      <div>
                        <span className="block font-bold text-navy-900">{property.bedrooms} Beds</span>
                        <span className="text-[11px] text-navy-500">Bedrooms</span>
                      </div>
                    </div>
                  )}

                  {property.bathrooms !== undefined && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-brand-600 shrink-0" />
                      <div>
                        <span className="block font-bold text-navy-900">{property.bathrooms} Baths</span>
                        <span className="text-[11px] text-navy-500">Bathrooms</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
                    <div>
                      <span className="block font-bold text-navy-900">{formattedDate}</span>
                      <span className="text-[11px] text-navy-500">Published Date</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-base font-bold text-navy-950">Detailed Overview</h2>
                  <div className="mt-3 text-sm text-navy-700 leading-relaxed whitespace-pre-line">
                    {property.description}
                  </div>
                </div>

                {/* Facilities & Utilities */}
                {property.facilities && property.facilities.length > 0 && (
                  <div className="mt-8 border-t border-navy-100 pt-6">
                    <h2 className="text-base font-bold text-navy-950">Facilities & Utilities Available</h2>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {property.facilities.map((fac, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-navy-200 bg-navy-50 px-3.5 py-1.5 text-xs font-semibold text-navy-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column: Sticky Action & WhatsApp Contact Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-28 rounded-3xl border border-navy-100 bg-white p-6 shadow-card space-y-6">
                <div>
                  <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                    {isWanted ? 'Target Budget' : 'Demand Price'}
                  </span>
                  <div className="mt-1 flex items-baseline gap-1 text-brand-700">
                    <span className="text-sm font-semibold">PKR</span>
                    <span className="text-3xl font-extrabold tracking-tight">
                      {formattedPrice}
                    </span>
                  </div>
                  {property.priceType && (
                    <span className="inline-block mt-1 text-xs font-medium text-navy-500 capitalize">
                      {property.priceType.toLowerCase()} terms
                    </span>
                  )}
                </div>

                {/* Contact Box */}
                <div className="border-t border-navy-100 pt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">
                      {property.contactName ? property.contactName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-navy-950">
                        {property.contactName || 'Advertiser'}
                      </h3>
                      <p className="text-xs text-navy-500">Direct Contact &bull; Verified Number</p>
                    </div>
                  </div>

                  {/* Interactive WhatsApp CTA & Lead Enquiry Form */}
                  <PropertyEnquirySection
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertySlug={property.slug}
                    propertyReferenceId={property.referenceId}
                    whatsappContact={property.whatsappContact}
                    contactName={property.contactName}
                  />
                </div>

                {/* Safety & Physical Inspection Notice */}
                <div className="rounded-2xl border border-navy-100 bg-navy-50 p-4 text-xs text-navy-600 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-navy-800">
                    <Shield className="h-4 w-4 text-brand-600" />
                    <span>Transaction Safety</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Always verify property ownership files at society offices (e.g. DHA, LDA, Bahria)
                    and perform physical inspections before signing purchase agreements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties Section (Section 5.I) */}
          {similarProperties.length > 0 && (
            <div className="mt-16 border-t border-navy-200 pt-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Similar Opportunities
                  </span>
                  <h2 className="mt-1 text-2xl font-bold text-navy-950">
                    Similar Properties in {property.location.area}
                  </h2>
                </div>
                <Link
                  href={`/properties-for-sale/lahore?area=${encodeURIComponent(property.location.area)}`}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800 transition"
                >
                  View All in {property.location.area} &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProperties.map((simProp) => (
                  <PropertyCard key={simProp.id} property={simProp} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
