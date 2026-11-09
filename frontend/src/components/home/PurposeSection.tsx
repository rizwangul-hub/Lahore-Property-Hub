import React from 'react';
import Link from 'next/link';
import { KeyRound, Home, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';

const PURPOSES = [
  {
    id: 'sale',
    title: 'Properties for Sale',
    tagline: 'Buy Your Dream Property in Lahore',
    description:
      'Explore ready-to-move houses, residential plots, and prime commercial investments across DHA, Bahria Town, and all Lahore sectors.',
    icon: Home,
    badge: 'Purchase Market',
    features: ['Verified locations', 'Direct owner & dealer contact', 'Houses, plots & commercial'],
    actionText: 'Browse Properties for Sale',
    actionHref: '/properties-for-sale/lahore',
    buttonColor: 'bg-brand-600 hover:bg-brand-700 text-white',
    iconBg: 'bg-brand-50 text-brand-600',
  },
  {
    id: 'rent',
    title: 'Properties for Rent',
    tagline: 'Rent Houses, Flats & Offices',
    description:
      'Find affordable and luxury rental properties in Lahore. Browse furnished apartments, family houses, commercial shops, and office spaces.',
    icon: KeyRound,
    badge: 'Rental Market',
    features: ['Furnished & unfurnished options', 'Prime residential & business hubs', 'Direct WhatsApp inquiry'],
    actionText: 'Browse Properties for Rent',
    actionHref: '/properties-for-rent/lahore',
    buttonColor: 'bg-navy-900 hover:bg-navy-950 text-white',
    iconBg: 'bg-navy-50 text-navy-800',
  },
  {
    id: 'wanted',
    title: 'Property Wanted',
    tagline: 'Publish Your Custom Requirements',
    description:
      'Can not find what you are looking for? Post your specific property requirement and let authorized sellers and realtors reach out with matching options.',
    icon: FileText,
    badge: 'Buyer / Tenant Requests',
    features: ['Free requirement posting', 'Targeted society matching', 'Instant alerts from owners'],
    actionText: 'Post Property Wanted',
    actionHref: '/property-wanted/lahore',
    buttonColor: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    iconBg: 'bg-emerald-50 text-emerald-700',
  },
];

export const PurposeSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-navy-50/50 border-b border-navy-100">
      <Container>
        <SectionHeading
          badge="Marketplace Pathways"
          title="Explore by Property Objective"
          subtitle="Whether you are buying your family home, leasing a commercial space, or posting custom property requirements, choose your pathway below."
          centered
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PURPOSES.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-navy-100 bg-white p-7 shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-brand-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg} transition-transform group-hover:scale-105`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-navy-950">{item.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-brand-700">{item.tagline}</p>
                  <p className="mt-3 text-sm text-navy-600 leading-relaxed">
                    {item.description}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-navy-100 pt-4">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-navy-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-navy-100">
                  <Link
                    href={item.actionHref}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition shadow-sm ${item.buttonColor}`}
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
