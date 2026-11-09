import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Container } from '@/components/common/Container';

export default function PrivacyPage() {
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
            <Shield className="h-4 w-4" />
            Legal & Trust
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-navy-600">
            Last updated: {new Date().getFullYear()} &bull; Lahore Property Hub
          </p>

          <div className="mt-8 space-y-6 text-sm text-navy-700 leading-relaxed">
            <p>
              Lahore Property Hub values your privacy. We are committed to safeguarding personal information
              collected when you use our real estate marketplace.
            </p>
            <h2 className="text-lg font-bold text-navy-950">1. Information We Collect</h2>
            <p>
              When posting a property listing or property wanted advertisement, we collect contact
              details such as your name, mobile or WhatsApp phone number, and property specifications.
            </p>
            <h2 className="text-lg font-bold text-navy-950">2. Public Browsing</h2>
            <p>
              Public visitors can browse listings, view society guides, and explore property photography
              without creating an account or providing sensitive personal information.
            </p>
            <h2 className="text-lg font-bold text-navy-950">3. Direct Contact</h2>
            <p>
              WhatsApp contact links connect prospective buyers and tenants directly with listing
              posters. We do not sell or trade your contact information to unsolicited third-party
              marketing companies.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
