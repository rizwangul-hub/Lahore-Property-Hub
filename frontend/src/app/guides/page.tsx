import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowRight, ShieldCheck, FileText, CheckCircle2, Calculator, Sparkles } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Lahore Real Estate Guides & Legal Insights | Property in Lahore',
  description:
    'Comprehensive Lahore property guides: document verification, registry vs transfer letter, tenancy contract bylaws, and Marla/Kanal plot dimension calculators.',
  alternates: {
    canonical: `${siteConfig.url}/guides`,
  },
  openGraph: {
    title: 'Lahore Real Estate Guides & Legal Insights | Property in Lahore',
    description:
      'Comprehensive Lahore property guides: document verification, registry vs transfer letter, tenancy contract bylaws, and Marla/Kanal plot dimension calculators.',
    url: `${siteConfig.url}/guides`,
    siteName: siteConfig.brandName,
    locale: 'en_PK',
    type: 'website',
    images: [siteConfig.ogImage],
  },
};

const GUIDES_LIST = [
  {
    slug: 'lahore-property-buying-guide',
    title: 'Lahore Property Buying Guide: Verification, Documents & Society Transfer Letters',
    description:
      'Step-by-step checklist on how to verify Fard Malkiat, NDC certificates, DHA/LDA transfer letters, and stamp duty payments before buying a home in Lahore.',
    readTime: '6 min read',
    category: 'Buying & Legal',
    icon: ShieldCheck,
  },
  {
    slug: 'lahore-house-rent-agreement-guide',
    title: 'Renting a House in Lahore: Tenant Agreement, Security Deposit & Utility Verification',
    description:
      'Everything you need to know about the Punjab Rented Premises Act 2009, 2-month security deposit standards, biometric police verification, and sub-meter checks.',
    readTime: '5 min read',
    category: 'Tenancy & Renting',
    icon: FileText,
  },
  {
    slug: 'marla-to-kanal-lahore-size-guide',
    title: '5 Marla vs 10 Marla vs 1 Kanal: Lahore Plot & House Size Dimensions Explained',
    description:
      'Complete comparison of 225 sq ft vs 272 sq ft Marla standards in Lahore, construction covered areas, room distributions, and society setback bylaws.',
    readTime: '4 min read',
    category: 'Dimensions & Planning',
    icon: Calculator,
  },
];

export default function GuidesIndexPage() {
  return (
    <div className="bg-navy-50/50 py-12 sm:py-16 min-h-[70vh]">
      <Container>
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
            <BookOpen className="h-3.5 w-3.5 text-brand-600" />
            Knowledge & Insights
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-navy-950">
            Lahore Property Guides & Legal Checklists
          </h1>
          <p className="mt-2 text-sm text-navy-600 leading-relaxed">
            Expert real estate guidance for property buyers, tenants, and investors navigating the Lahore market.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {GUIDES_LIST.map((guide) => {
            const Icon = guide.icon;
            return (
              <article
                key={guide.slug}
                className="flex flex-col justify-between rounded-3xl border border-navy-100 bg-white p-6 shadow-sm hover:shadow-md transition group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-navy-400">
                      {guide.readTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      {guide.category}
                    </span>
                    <h2 className="mt-1 text-base font-bold text-navy-950 group-hover:text-brand-600 transition leading-snug">
                      {guide.title}
                    </h2>
                  </div>

                  <p className="text-xs text-navy-600 leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-navy-100">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800 transition"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
