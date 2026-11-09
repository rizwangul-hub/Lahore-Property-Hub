import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { AreaCard } from '@/components/property/AreaCard';
import { LAHORE_AREAS } from '@/config/site';

export default function LocationsPage() {
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

        <SectionHeading
          badge="Societies & Neighborhoods"
          title="All Lahore Property Locations"
          subtitle="Explore all premier societies, residential housing schemes, and commercial hubs in Lahore."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LAHORE_AREAS.map((area) => (
            <AreaCard key={area.slug} area={area} />
          ))}
        </div>
      </Container>
    </div>
  );
}
