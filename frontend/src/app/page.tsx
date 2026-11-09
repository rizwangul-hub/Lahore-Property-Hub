import type { Metadata } from 'next';
import { HeroSlider } from '@/components/home/HeroSlider';
import { PropertySearch } from '@/components/home/PropertySearch';
import { PurposeSection } from '@/components/home/PurposeSection';
import { BrowseAreasSection } from '@/components/home/BrowseAreasSection';
import { PropertyCategoriesSection } from '@/components/home/PropertyCategoriesSection';
import { FeaturedPropertiesSection } from '@/components/home/FeaturedPropertiesSection';
import { LatestPropertiesSection } from '@/components/home/LatestPropertiesSection';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { PostPropertyCTA } from '@/components/home/PostPropertyCTA';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Lahore Property Hub | Find Houses, Plots, Apartments & Commercial Properties',
  description:
    'Find houses, apartments, plots, shops, and commercial properties for rent or sale in Lahore. Explore Bahria Town, Johar Town, DHA, Gulberg, and other areas.',
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: 'Lahore Property Hub | Find Houses, Plots, Apartments & Commercial Properties',
    description:
      'Find houses, apartments, plots, shops, and commercial properties for rent or sale in Lahore. Explore Bahria Town, Johar Town, DHA, Gulberg, and other areas.',
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_PK',
    type: 'website',
  },
};

export default function HomePage() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/properties-for-sale/lahore?area={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className="flex flex-col">
        {/* 1. Hero Section with 7-Image 3-Second Automatic Slider */}
        <HeroSlider />

      {/* 2. Property Search Interface */}
      <PropertySearch />

      {/* 3. Property Purpose Section (Sale / Rent / Wanted) */}
      <PurposeSection />

      {/* 4. Browse Properties by Lahore Area */}
      <BrowseAreasSection />

      {/* 5. Property Categories Section (Houses, Plots, Commercial, etc.) */}
      <PropertyCategoriesSection />

      {/* 6. Featured Properties (Database ready UI with empty/loading state) */}
      <FeaturedPropertiesSection />

      {/* 7. Latest Properties (Database ready UI with empty/loading state) */}
      <LatestPropertiesSection />

      {/* 8. Why Choose Lahore Property Hub */}
      <WhyChooseUsSection />

      {/* 9. Post Property Call to Action Banner */}
      <PostPropertyCTA />
    </div>
    </>
  );
}
