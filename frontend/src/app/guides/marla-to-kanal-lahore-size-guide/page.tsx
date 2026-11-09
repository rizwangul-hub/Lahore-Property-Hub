import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calculator, CheckCircle2, Home, Layers } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: '5 Marla vs 10 Marla vs 1 Kanal: Lahore Plot & House Size Comparison | Lahore Property Hub',
  description:
    'Complete guide to land measurement units in Lahore: 225 sq ft vs 272 sq ft Marla standards, covered area benchmarks, room distributions, and society construction setbacks.',
  alternates: {
    canonical: `${siteConfig.url}/guides/marla-to-kanal-lahore-size-guide`,
  },
  openGraph: {
    title: '5 Marla vs 10 Marla vs 1 Kanal: Lahore Plot & House Size Comparison | Lahore Property Hub',
    description:
      'Complete guide to land measurement units in Lahore: 225 sq ft vs 272 sq ft Marla standards, covered area benchmarks, room distributions, and society construction setbacks.',
    url: `${siteConfig.url}/guides/marla-to-kanal-lahore-size-guide`,
    siteName: siteConfig.brandName,
    locale: 'en_PK',
    type: 'article',
    images: [siteConfig.ogImage],
  },
};

export default function MarlaKanalGuidePage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '5 Marla vs 10 Marla vs 1 Kanal: Lahore Plot Dimensions & Covered Area Guide',
    description:
      'Detailed calculation of Lahore plot dimensions, covered construction area, and layout planning.',
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
    datePublished: '2026-03-01T08:00:00+05:00',
    dateModified: '2026-11-09T08:00:00+05:00',
    mainEntityOfPage: `${siteConfig.url}/guides/marla-to-kanal-lahore-size-guide`,
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Dimensions & Planning &bull; 4 min read
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight leading-tight">
                5 Marla vs 10 Marla vs 1 Kanal: Lahore Plot Dimensions & Covered Area Explained
              </h1>
              <p className="text-xs sm:text-sm text-navy-500">
                Land measurement standards in Lahore societies &bull; Updated for 2026
              </p>
            </div>

            <div className="prose prose-navy max-w-none space-y-6 text-sm text-navy-700 leading-relaxed">
              <p>
                One of the most frequent points of confusion for property buyers in Lahore is how a "Marla" is measured. Depending on the authority (LDA vs Board of Revenue vs private developers), the square footage of a Marla varies.
              </p>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <Calculator className="h-5 w-5 text-purple-600" />
                1. The 225 Sq Ft vs 272 Sq Ft Standard in Lahore
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                <li>
                  <strong>LDA & Modern Societies (225 sq ft Marla):</strong> Lahore Development Authority (LDA), DHA Lahore, Bahria Town, Lake City, and Wapda Town universally define 1 Marla as <strong>225 square feet</strong> (25 square yards). Under this standard, 1 Kanal = 20 Marlas = <strong>4,500 square feet</strong>.
                </li>
                <li>
                  <strong>Traditional Revenue Records (272.25 sq ft Marla):</strong> Rural land records and older Patwari documentation use the British Karam standard where 1 Marla equals <strong>272.25 square feet</strong> (1 Kanal = 5,445 sq ft).
                </li>
              </ul>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <Layers className="h-5 w-5 text-purple-600" />
                2. Standard Plot Dimensions in Lahore Societies
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-navy-100 rounded-xl overflow-hidden">
                  <thead className="bg-navy-950 text-white">
                    <tr>
                      <th className="p-3">Plot Category</th>
                      <th className="p-3">Standard Dimensions</th>
                      <th className="p-3">Total Area</th>
                      <th className="p-3">Typical Layout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100 bg-white">
                    <tr>
                      <td className="p-3 font-bold text-navy-950">5 Marla</td>
                      <td className="p-3">25 ft &times; 45 ft</td>
                      <td className="p-3">1,125 sq ft</td>
                      <td className="p-3">3 to 4 Bedrooms, 1 Car Porch</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy-950">10 Marla</td>
                      <td className="p-3">35 ft &times; 65 ft</td>
                      <td className="p-3">2,275 sq ft</td>
                      <td className="p-3">4 to 5 Bedrooms, 2 Car Porches</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy-950">1 Kanal</td>
                      <td className="p-3">50 ft &times; 90 ft</td>
                      <td className="p-3">4,500 sq ft</td>
                      <td className="p-3">5 to 6 Bedrooms, Lawn, 3+ Cars</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-navy-950">2 Kanal</td>
                      <td className="p-3">75 ft &times; 120 ft</td>
                      <td className="p-3">9,000 sq ft</td>
                      <td className="p-3">Luxury Designer Villa, Large Garden</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-xl font-bold text-navy-950 flex items-center gap-2 pt-4">
                <Home className="h-5 w-5 text-purple-600" />
                3. Society Setback Bylaws
              </h2>
              <p>
                In societies like DHA and Bahria Town, mandatory open spaces (setbacks) must be left during construction:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li><strong>5 Marla:</strong> 5 ft front setback.</li>
                <li><strong>10 Marla:</strong> 8 ft front setback and 4 ft rear setback.</li>
                <li><strong>1 Kanal:</strong> 10 ft front setback, 5 ft rear setback, and 5 ft side open spaces.</li>
              </ul>

              <div className="rounded-2xl bg-purple-50 border border-purple-100 p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-purple-950">Looking for plots in Lahore?</div>
                  <div className="text-xs text-purple-700">Filter 5 Marla, 10 Marla, and 1 Kanal plots across DHA, Bahria & more.</div>
                </div>
                <Link
                  href="/properties/category/plots"
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition shrink-0"
                >
                  Explore Plots in Lahore
                </Link>
              </div>
            </div>
          </article>
        </Container>
      </div>
    </>
  );
}
