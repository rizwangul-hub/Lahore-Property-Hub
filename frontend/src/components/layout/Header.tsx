'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, PlusCircle, Search } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMenu = () => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      router.push(`/properties-for-sale/lahore?area=${encodeURIComponent(quickSearchQuery.trim().toLowerCase())}`);
      setSearchOpen(false);
      setQuickSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy-100 bg-white/95 backdrop-blur-md transition-shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex h-20 w-[min(34vw,120px)] items-center transition-opacity hover:opacity-90 sm:w-[140px]"
          aria-label="Property in Lahore home"
        >
          <Image
            src="/logo.jpg"
            alt="Property in Lahore"
            width={2400}
            height={1792}
            priority
            sizes="(max-width: 640px) 34vw, 140px"
            className="h-auto max-h-[68px] w-full object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
          {siteConfig.navLinks.map((link) => {
            const isActive = pathname === link.href;

            if (link.highlight) {
              return null; // Rendered prominently next to nav
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-brand-600 font-bold bg-brand-50/50'
                    : 'text-navy-700 hover:text-navy-950 hover:bg-navy-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Quick Search Toggle */}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 transition hover:bg-navy-100 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Search properties"
            title="Search properties"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Post Property Prominent Button */}
          <Link
            href="/post-property"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post Property</span>
          </Link>
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            className="p-2 text-navy-700 hover:bg-navy-100 rounded-lg focus:outline-none"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-lg p-2 text-navy-700 hover:bg-navy-100 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Quick Search Bar Drawer */}
      {searchOpen && (
        <div className="border-t border-navy-100 bg-navy-50/90 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleQuickSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder="Quick search by area (e.g. DHA Phase 6, Bahria Town, Gulberg)..."
                  className="w-full rounded-xl border border-navy-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-navy-900 focus:border-brand-500 focus:outline-none shadow-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-brand-700 shadow-sm"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs text-navy-500 hover:text-navy-700 p-2"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-navy-100 bg-white px-4 pt-3 pb-6 lg:hidden shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {siteConfig.navLinks.map((link) => {
              const isActive = pathname === link.href;

              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-navy-700 hover:bg-navy-50 hover:text-navy-950'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
