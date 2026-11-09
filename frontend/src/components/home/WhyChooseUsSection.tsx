import React from 'react';
import {
  MapPin,
  MessageCircle,
  Search,
  FileCheck2,
  Building2,
  FileText,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const BENEFITS = [
  {
    icon: MapPin,
    title: 'Explore Properties Across Lahore',
    description:
      'Targeted coverage spanning Bahria Town, DHA, Johar Town, Gulberg, Model Town, and expanding suburban corridors.',
  },
  {
    icon: MessageCircle,
    title: 'Direct WhatsApp Contact',
    description:
      'Initiate instant WhatsApp conversations with property owners and authorized dealers without third-party delay.',
  },
  {
    icon: Search,
    title: 'Easy Property Discovery',
    description:
      'Intuitive filtering by property purpose, category, society, and price brackets designed for fast, frictionless browsing.',
  },
  {
    icon: FileCheck2,
    title: 'Detailed Property Information',
    description:
      'Clear property specifications including plot and house dimensions, bedrooms, floor plans, and authentic photos.',
  },
  {
    icon: Building2,
    title: 'Residential & Commercial Listings',
    description:
      'Comprehensive inventory for family living, commercial offices, retail shops, industrial plots, and warehouses.',
  },
  {
    icon: FileText,
    title: 'Property Wanted Advertisements',
    description:
      'Publish your exact property requirements publicly so matching sellers and realtors can approach you directly.',
  },
];

export const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-navy-50/50">
      <Container>
        <SectionHeading
          badge="Marketplace Advantages"
          title="Why Choose Lahore Property Hub"
          subtitle="A specialized real estate portal built specifically for Lahore's dynamic property market."
          centered
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-navy-100 bg-white p-6 sm:p-7 shadow-subtle transition-all duration-300 hover:shadow-card hover:border-brand-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 mb-5">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-navy-950">{item.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-navy-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
