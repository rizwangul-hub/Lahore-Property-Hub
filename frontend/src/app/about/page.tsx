import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ShieldCheck, MapPin, Users, CheckCircle, ArrowRight, PhoneCall, Sparkles } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About Us | Lahore Property Hub - Pakistan Real Estate Portal',
  description:
    'Learn about Lahore Property Hub, the premier property marketplace in Lahore, Pakistan. Discover our verified listing standards, zero broker commission browsing, and direct WhatsApp seller contact.',
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: 'About Us | Lahore Property Hub - Pakistan Real Estate Portal',
    description:
      'Learn about Lahore Property Hub, the premier property marketplace in Lahore, Pakistan. Discover our verified listing standards, zero broker commission browsing, and direct WhatsApp seller contact.',
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.brandName,
    locale: 'en_PK',
    type: 'website',
    images: [siteConfig.ogImage],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Lahore Property Hub',
    description:
      'Premier real estate marketplace dedicated exclusively to Lahore, Pakistan properties.',
    url: `${siteConfig.url}/about`,
    mainEntity: {
      '@type': 'RealEstateAgent',
      name: siteConfig.brandName,
      url: siteConfig.url,
      telephone: '+92-300-1234567',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lahore',
        addressRegion: 'Punjab',
        addressCountry: 'PK',
      },
      areaServed: 'Lahore',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <div className="bg-navy-50/50 py-12 sm:py-16">
        <Container>
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" />
              Dedicated Lahore Real Estate Portal
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy-950">
              Transforming Property Discovery in <span className="text-brand-600">Lahore</span>
            </h1>
            <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
              Lahore Property Hub was created to eliminate fake advertisements, hidden commissions, and endless phone loops. We connect buyers, tenants, owners, and licensed realtors across Lahore directly via WhatsApp.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-navy-950">100% Moderated Listings</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                Every advertisement submitted to our platform undergoes strict administrative inspection. We screen for authentic photography, verified dimensions, and active phone numbers before going live.
              </p>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <PhoneCall className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-navy-950">Direct WhatsApp Inquiries</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                Connect instantly with sellers and genuine real estate agents. No registration barriers, no paywalls, and no hidden buyer commission charges.
              </p>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-navy-950">Comprehensive Lahore Reach</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                From DHA Lahore and Bahria Town to Gulberg, Model Town, Lake City, and Raiwind Road, explore targeted property landing pages with society pricing insights and street-level transparency.
              </p>
            </div>
          </div>

          {/* Mission & Verification Standards */}
          <div className="mt-14 rounded-3xl bg-white border border-navy-100 p-8 sm:p-12 shadow-sm space-y-8">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl font-black text-navy-950">Our Verification & Quality Standards</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                We know how frustrating outdated or duplicated real estate advertisements are. That is why Lahore Property Hub implements automated anti-spam checks and manual editorial approval on every single listing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-navy-700">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero duplicate property postings per dealer or society sector.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verified Marla, Kanal, and Square Feet unit conversions.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automatic expiry of unmaintained and sold listings.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dedicated Property Wanted directory for custom buyer requirements.</span>
              </div>
            </div>

            <div className="pt-6 border-t border-navy-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-navy-950">Ready to list your Lahore property?</div>
                <div className="text-xs text-navy-500">Reach verified buyers and tenants today for free.</div>
              </div>
              <Link
                href="/post-property"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition shadow-sm"
              >
                <span>Post Free Property</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
