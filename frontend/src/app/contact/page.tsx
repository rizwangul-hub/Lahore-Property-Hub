import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle, Clock, ShieldCheck, ArrowLeft, Send } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Us | Lahore Property Hub Support & Inquiries',
  description:
    'Get in touch with the Lahore Property Hub team. Reach our Lahore office via WhatsApp, email, or telephone for property listing assistance, dealer verification, and inquiries.',
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: 'Contact Us | Lahore Property Hub Support & Inquiries',
    description:
      'Get in touch with the Lahore Property Hub team. Reach our Lahore office via WhatsApp, email, or telephone for property listing assistance, dealer verification, and inquiries.',
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.brandName,
    locale: 'en_PK',
    type: 'website',
    images: [siteConfig.ogImage],
  },
};

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Lahore Property Hub',
    description: 'Customer support, listing inquiries, and dealer partnerships for Lahore Property Hub.',
    url: `${siteConfig.url}/contact`,
    mainEntity: {
      '@type': 'RealEstateAgent',
      name: siteConfig.brandName,
      telephone: '+92-300-1234567',
      email: 'support@propertyinlahore.online',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Main Boulevard, Gulberg III',
        addressLocality: 'Lahore',
        addressRegion: 'Punjab',
        postalCode: '54000',
        addressCountry: 'PK',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '19:00',
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <div className="bg-navy-50/50 py-12 sm:py-16">
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

          <div className="max-w-2xl">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              We are here to assist you
            </span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-navy-950">
              Contact Lahore Property Hub
            </h1>
            <p className="mt-2 text-sm text-navy-600 leading-relaxed">
              Have questions regarding listing your property, dealer verification, or navigating societies in Lahore? Reach out through our official channels.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* WhatsApp Support */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">Direct WhatsApp Helpdesk</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                Chat with our real estate support desk for quick questions on property submission or moderation status.
              </p>
              <a
                href="https://wa.me/923001234567?text=Hello%20Lahore%20Property%20Hub%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition pt-2"
              >
                <span>Chat on WhatsApp: +92 300 1234567</span>
              </a>
            </div>

            {/* Email Support */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">Official Email Support</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                Send official inquiries, partnership proposals, and verification documents directly to our mailbox.
              </p>
              <a
                href="mailto:support@propertyinlahore.online"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-800 transition pt-2"
              >
                <span>support@propertyinlahore.online</span>
              </a>
            </div>

            {/* Lahore Office Address */}
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-navy-950">Lahore Headquarters</h2>
              <p className="text-xs text-navy-600 leading-relaxed">
                Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-navy-500 pt-2">
                <Clock className="h-3.5 w-3.5 text-navy-400" />
                <span>Mon – Sat: 9:00 AM – 7:00 PM PKT</span>
              </div>
            </div>
          </div>

          {/* Quick FAQ Section */}
          <div className="mt-14 rounded-3xl bg-white border border-navy-100 p-8 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-navy-950">Frequently Asked Inquiries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-navy-700 leading-relaxed">
              <div className="space-y-1.5">
                <div className="font-bold text-navy-950">How long does property approval take?</div>
                <p className="text-navy-600">
                  Submissions are reviewed by our moderation desk within 2 to 6 hours during standard operating hours.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-navy-950">Is listing properties free?</div>
                <p className="text-navy-600">
                  Yes, genuine owners and estate consultants can publish standard property advertisements without any upfront fees.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-navy-950">Can I post commercial buildings or plots?</div>
                <p className="text-navy-600">
                  Absolutely. We support Houses, Flats, Residential/Commercial Plots, Shops, Offices, and Warehouses across all Lahore sectors.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-navy-950">How do buyers contact me?</div>
                <p className="text-navy-600">
                  Interested buyers and tenants reach you directly using your provided WhatsApp phone number.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
