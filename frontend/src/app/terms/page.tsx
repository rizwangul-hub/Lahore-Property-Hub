import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Property in Lahore',
  description:
    'Review the Terms & Conditions of Property in Lahore. Clear rules and guidelines for posting property listings and browsing real estate in Lahore.',
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="py-12 bg-white min-h-[70vh]">
      <Container>
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-brand-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            Terms of Service
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-navy-600">
            Last updated: {new Date().getFullYear()} &bull; Property in Lahore
          </p>

          <div className="mt-8 space-y-6 text-sm text-navy-700 leading-relaxed">
            <p>
              By accessing and using Property in Lahore, you agree to comply with and be bound by the
              following terms and conditions governing our real estate platform.
            </p>
            <h2 className="text-lg font-bold text-navy-950">1. Marketplace Platform Role</h2>
            <p>
              Property in Lahore provides an advertising and discovery platform connecting property
              buyers, sellers, tenants, and dealers in Lahore, Pakistan. We do not act as an escrow agent
              or certify real property titles.
            </p>
            <h2 className="text-lg font-bold text-navy-950">2. Listing Accuracy</h2>
            <p>
              Users posting properties represent and warrant that the property descriptions, locations,
              pricing, and photos submitted are accurate and not misleading.
            </p>
            <h2 className="text-lg font-bold text-navy-950">3. Direct Dealings & Due Diligence</h2>
            <p>
              Buyers and tenants are strongly advised to conduct standard physical inspections, legal
              title verifications with society management offices (such as DHA, LDA, or Bahria Town),
              prior to executing any financial transaction.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
