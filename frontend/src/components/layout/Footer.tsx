import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-navy-200 bg-white text-navy-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" aria-label="Property in Lahore home">
                <Image
                  src="/logo.jpg"
                  alt="Property in Lahore"
                  width={2400}
                  height={1792}
                  sizes="128px"
                  className="h-auto w-32 rounded"
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-navy-600">
              The premier property marketplace dedicated to Lahore, Pakistan. Discover homes,
              plots, and commercial real estate with direct WhatsApp contact.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-navy-500">
              <MapPin className="h-4 w-4 text-brand-600" />
              <span>Lahore, Punjab, Pakistan</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Explore Marketplace
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-navy-600 hover:text-brand-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/buy" className="text-navy-600 hover:text-brand-600 transition-colors">
                  Buy Properties
                </Link>
              </li>
              <li>
                <Link href="/rent" className="text-navy-600 hover:text-brand-600 transition-colors">
                  Rent Properties
                </Link>
              </li>
              <li>
                <Link href="/wanted" className="text-navy-600 hover:text-brand-600 transition-colors">
                  Property Wanted
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-navy-600 hover:text-brand-600 transition-colors">
                  All Lahore Locations
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-navy-600 hover:text-brand-600 transition-colors">
                  Property Guides & Laws
                </Link>
              </li>
              <li>
                <Link href="/post-property" className="text-navy-600 hover:text-brand-600 transition-colors font-medium text-brand-700">
                  Post Free Property Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Lahore Areas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Popular Lahore Areas
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-navy-600">
              {siteConfig.popularAreas.map((area) => (
                <li key={area}>
                  <Link
                    href={`/properties-for-sale/lahore?area=${encodeURIComponent(
                      area.toLowerCase().replace(/\s+/g, '-')
                    )}`}
                    className="hover:text-brand-600 transition-colors"
                  >
                    {area} Properties
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Transparency */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              Direct Inquiries
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              Connect directly with verified owners, real estate dealers, and tenants across Lahore
              without intermediate commissions.
            </p>
            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-800">
                <MessageCircle className="h-4 w-4 text-brand-600" />
                Direct WhatsApp Contact
              </div>
              <p className="mt-1.5 text-[11px] text-brand-700 leading-relaxed">
                Start instant chat conversations on individual property listings once published.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Dynamic Copyright */}
        <div className="mt-12 border-t border-navy-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-500">
          <p>
            &copy; {currentYear} {siteConfig.brandName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/about" className="hover:text-navy-900 transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="hover:text-navy-900 transition-colors">
              Contact Us
            </Link>
            <Link href="/privacy" className="hover:text-navy-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-navy-900 transition-colors">
              Terms & Conditions
            </Link>
            <span>Lahore, Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
