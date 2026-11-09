import React from 'react';
import Link from 'next/link';
import { PlusCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/common/Container';

export const PostPropertyCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-navy-100">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 p-8 sm:p-12 md:p-16 text-white shadow-hover">
          {/* Subtle architectural backdrop pattern */}
          <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3.5 py-1 text-xs font-semibold text-brand-300 border border-brand-500/30 mb-4">
              <span className="h-2 w-2 rounded-full bg-brand-400" />
              Direct Owner & Dealer Connections
            </span>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Have a Property to Sell or Rent?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
              Reach people searching for properties across Lahore. Share your property details and
              connect directly with interested buyers and tenants.
            </p>

            {/* Benefit Bullets */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-400" />
                <span>Zero Middleman Charges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-400" />
                <span>Direct WhatsApp Inquiries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-400" />
                <span>Lahore-Wide Exposure</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/post-property"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-600 active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post Your Property</span>
              </Link>
              <Link
                href="/wanted"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
              >
                <FileText className="h-4 w-4" />
                <span>Property Wanted</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
