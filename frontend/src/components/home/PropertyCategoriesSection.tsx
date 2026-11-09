import React from 'react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { PROPERTY_CATEGORIES } from '@/config/site';

export const PropertyCategoriesSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-navy-50/50 border-b border-navy-100">
      <Container>
        <SectionHeading
          badge="Property Types"
          title="Browse by Property Category"
          subtitle="From family houses and executive apartments to investment plots and corporate offices, find listings tailored to your property type."
          actionText="All Categories"
          actionHref="/buy"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </Container>
    </section>
  );
};
