import React from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { AreaCard } from '@/components/property/AreaCard';
import { LAHORE_AREAS } from '@/config/site';

export const BrowseAreasSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-navy-100">
      <Container>
        <SectionHeading
          badge="Lahore Societies"
          title="Browse Properties by Prime Location"
          subtitle="Explore residential and commercial real estate across Lahore's most prominent societies, gated communities, and business centers."
          actionText="View All Locations"
          actionHref="/locations"
        />

        {/* 8 Lahore Area Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LAHORE_AREAS.map((area) => (
            <AreaCard key={area.slug} area={area} />
          ))}
        </div>
      </Container>
    </section>
  );
};
