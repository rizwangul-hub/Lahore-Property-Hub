import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Building2 } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Lahore Property Buying Guide: Verification & Transfer Bylaws | Property in Lahore',
  description:
    'Comprehensive step-by-step checklist on buying property in Lahore: verifying Fard Malkiat, NDC certificate, DHA/LDA transfer procedures, and tax payments.',
  alternates: {
    canonical: `${siteConfig.url}/guides/lahore-property-buying-guide`,
  },
  openGraph: {
    title: 'Lahore Property Buying Guide: Verification & Transfer Bylaws | Property in Lahore',
    description:
      'Comprehensive step-by-step checklist on buying property in Lahore: verifying Fard Malkiat, NDC certificate, DHA/LDA transfer procedures, and tax payments.',
    url: `${siteConfig.url}/guides/lahore-property-buying-guide`,
    siteName: siteConfig.brandName,
    locale: 'en_PK',
    type: 'article',
    images: [siteConfig.ogImage],
  },
};

export default function BuyingGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Lahore Property Buying Guide: Verification & Transfer Procedures',
    description:
      'A complete legal and practical checklist for buying houses, apartments, and plots across Lahore.',
    author: {
      '@type': 'Organization',
      name: siteConfig.brandName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.brandName,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icon.png`,
      },
    },
    datePublished: '2026-01-15T08:00:00+05:00',
    dateModified: '2026-11-09T08:00:00+05:00',
    mainEntityOfPage: `${siteConfig.url}/guides/lahore-property-buying-guide`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <div className="bg-navy-50/50 py-12 sm:py-16">
        <Container>
          <div className="mb-6">
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-brand-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Guides
            </Link>
          </div>

          <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-navy-100 p-6 sm:p-12 shadow-sm space-y-8">
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Buying & Legal Guide &bull; 6 min read
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight leading-tight">
                Lahore Property Buying Guide: Verification, Documents & Transfer Letters
              </h1>
              <p className="text-xs sm:text-sm text-navy-500">
                Published by Property in Lahore Research Team &bull; Updated for 2026 Tax Regulations
              </p>
            </div>

            <div className="prose prose-navy max-w-none space-y-6 text-sm text-navy-700 leading-relaxed">
              <p>
                Purchasing a house, commercial building, or plot in Lahore represents one of the most substantial financial investments an individual or family will make. Whether you are eyeing established sectors like DHA Lahore, Bahria Town, and Johar Town or emerging corridors along Raiwind Road and Lake City, conducting thorough due diligence is vital to avoiding legal disputes.
              </p>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <ShieldCheck className="h-5 w-5 text-brand-600" />
                1. Understanding Property Title Documents in Lahore
              </h2>
              <p>
                In Lahore, property transactions broadly fall into two legal mechanisms:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>Registry Intiqal (Mutation via Sub-Registrar / PLRA):</strong> Traditional urban areas and LDA approved older schemes transfer ownership via registered sale deeds (Baye-Nama) recorded at Punjab Land Records Authority (Arazi Record Center).
                </li>
                <li>
                  <strong>Society Transfer Letter:</strong> Gated authorities such as Defence Housing Authority (DHA Lahore), Bahria Town, and Lake City manage private transfers through official Transfer Letters issued at their central customer service branches.
                </li>
              </ul>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <FileText className="h-5 w-5 text-brand-600" />
                2. Mandatory Document Verification Checklist
              </h2>
              <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-5 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>No Demand Certificate (NDC):</strong> Obtains clearance that water, sewerage, maintenance, and development charges are fully settled.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Approved Building Plan (Sitemap):</strong> Confirm the house layout complies with LDA or DHA construction setbacks.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Original Allotment / Transfer Letter:</strong> Inspect the physical original document at the society office with both buyer and seller present.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>FBR Tax Payer Status (Active Taxpayer List):</strong> Ensure your filer status is active to avoid heightened withholding taxes on property purchases under Section 236K.</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                3. Critical Red Flags to Watch Out For
              </h2>
              <p>
                Never issue advance token money (Biyana) without verifying CNIC validity, confirming the seller is the sole titleholder, or verifying power of attorney (Mukhtar Nama) authenticity at the society legal office.
              </p>

              <div className="rounded-2xl bg-brand-50 border border-brand-100 p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-brand-950">Looking for verified properties in Lahore?</div>
                  <div className="text-xs text-brand-700">Browse approved houses and plots with direct WhatsApp contact.</div>
                </div>
                <Link
                  href="/properties-for-sale/lahore"
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition shrink-0"
                >
                  Browse Lahore Properties
                </Link>
              </div>
            </div>
          </article>
        </Container>
      </div>
    </>
  );
}
