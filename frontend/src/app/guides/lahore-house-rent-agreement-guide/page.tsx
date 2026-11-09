import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Renting a House in Lahore: Tenant Agreement & Security Checklist | Lahore Property Hub',
  description:
    'Essential guide to renting a house in Lahore: Punjab Rented Premises Act 2009 compliance, 2-month security deposit norms, police tenant registration, and utility meter checks.',
  alternates: {
    canonical: `${siteConfig.url}/guides/lahore-house-rent-agreement-guide`,
  },
  openGraph: {
    title: 'Renting a House in Lahore: Tenant Agreement & Security Checklist | Lahore Property Hub',
    description:
      'Essential guide to renting a house in Lahore: Punjab Rented Premises Act 2009 compliance, 2-month security deposit norms, police tenant registration, and utility meter checks.',
    url: `${siteConfig.url}/guides/lahore-house-rent-agreement-guide`,
    siteName: siteConfig.name,
    locale: 'en_PK',
    type: 'article',
  },
};

export default function RentAgreementGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Renting a House in Lahore: Tenancy Agreement and Verification Guide',
    description:
      'Guide for tenants and landlords on drafting compliant rental agreements in Lahore.',
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/icon.svg`,
      },
    },
    datePublished: '2026-02-10T08:00:00+05:00',
    dateModified: '2026-11-09T08:00:00+05:00',
    mainEntityOfPage: `${siteConfig.url}/guides/lahore-house-rent-agreement-guide`,
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Tenancy & Renting &bull; 5 min read
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight leading-tight">
                Renting a House in Lahore: Tenant Agreement, Security Deposit & Utility Checks
              </h1>
              <p className="text-xs sm:text-sm text-navy-500">
                Guidelines according to Punjab Rented Premises Act &bull; Updated for 2026
              </p>
            </div>

            <div className="prose prose-navy max-w-none space-y-6 text-sm text-navy-700 leading-relaxed">
              <p>
                Renting residential property in Lahore requires an explicit written agreement to protect both landlord and tenant rights. By understanding local market norms in Bahria Town, DHA, Johar Town, Model Town, and Wapda Town, tenants can guarantee a secure and frictionless tenancy.
              </p>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <FileText className="h-5 w-5 text-emerald-600" />
                1. Standard Terms in a Lahore Tenancy Contract
              </h2>
              <p>
                Under the Punjab Rented Premises Act 2009, all tenancy agreements must be registered with the local Rent Registrar or police station. Crucial clauses include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li><strong>Tenancy Duration:</strong> Typically executed for 11 months, renewable mutually.</li>
                <li><strong>Security Deposit:</strong> Local custom specifies 2 to 3 months of refundable rent held as a security deposit against unpaid utility charges or property damages.</li>
                <li><strong>Annual Rent Escalation:</strong> Standard annual increase usually ranges between 10% and 12%.</li>
                <li><strong>Notice Period:</strong> Either party can terminate tenancy with 30 or 60 days advance written notice.</li>
              </ul>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                2. Mandatory Police Verification & Tenant Registration
              </h2>
              <p>
                Under Punjab information of temporary residents legislation, every landlord in Lahore is legally obligated to register the tenant’s biometric details, CNIC, and tenancy agreement with the local Lahore Police station (Khidmat Markaz) within 15 days of occupancy.
              </p>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <KeyRound className="h-5 w-5 text-emerald-600" />
                3. Pre-Move-in Utility Clearance Checklist
              </h2>
              <p>
                Before receiving keys, ensure you obtain verified receipts for:
              </p>
              <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-5 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>LESCO electricity meter reading and zero arrears confirmation.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>SNGPL gas bill clearance and pressure check during winter months.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>WASA water supply and sewerage maintenance receipts.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Society maintenance dues (e.g., Bahria / DHA security and garbage disposal fees).</span>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-emerald-950">Looking for rental houses or flats in Lahore?</div>
                  <div className="text-xs text-emerald-700">Find direct owner listings with zero brokerage browsing.</div>
                </div>
                <Link
                  href="/properties-for-rent/lahore"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shrink-0"
                >
                  Explore Rental Houses
                </Link>
              </div>
            </div>
          </article>
        </Container>
      </div>
    </>
  );
}
