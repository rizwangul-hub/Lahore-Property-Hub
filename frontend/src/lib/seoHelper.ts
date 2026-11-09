import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

const AREA_NAME_MAP: Record<string, string> = {
  'bahria-town': 'Bahria Town',
  'dha': 'DHA Defence',
  'dha-defence': 'DHA Defence',
  'johar-town': 'Johar Town',
  'gulberg': 'Gulberg',
  'model-town': 'Model Town',
  'wapda-town': 'Wapda Town',
  'valencia-town': 'Valencia Town',
  'askari': 'Askari',
  'lake-city': 'Lake City',
  'raiwind-road': 'Raiwind Road',
  'maraka': 'Maraka',
  'lahore-cantt': 'Lahore Cantt',
  'faisal-town': 'Faisal Town',
  'township': 'Township',
  'allama-iqbal-town': 'Allama Iqbal Town',
};

const TYPE_NAME_MAP: Record<string, string> = {
  house: 'Houses',
  apartment: 'Apartments',
  plot: 'Plots',
  shop: 'Commercial Shops',
  office: 'Offices',
  'commercial-building': 'Commercial Buildings',
  warehouse: 'Warehouses',
};

export function formatAreaName(rawArea?: string): string {
  if (!rawArea || rawArea === 'all' || rawArea.toLowerCase() === 'lahore') {
    return 'Lahore';
  }
  const clean = rawArea.toLowerCase().trim();
  if (AREA_NAME_MAP[clean]) {
    return AREA_NAME_MAP[clean];
  }
  return clean
    .replace(/-lahore$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatTypeName(rawType?: string): string {
  if (!rawType || rawType === 'all') {
    return 'Properties';
  }
  const clean = rawType.toLowerCase().trim();
  if (TYPE_NAME_MAP[clean]) {
    return TYPE_NAME_MAP[clean];
  }
  return clean.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface DynamicSearchMetaOptions {
  purpose: 'SALE' | 'RENT' | 'WANTED';
  basePath: string;
  searchParams?: {
    area?: string;
    type?: string;
    society?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export function generateDynamicSearchMetadata({
  purpose,
  basePath,
  searchParams,
}: DynamicSearchMetaOptions): Metadata {
  const areaName = formatAreaName(searchParams?.area);
  const typeName = formatTypeName(searchParams?.type);
  const isAllLahore = areaName === 'Lahore';
  const isAllTypes = typeName === 'Properties';

  let title = '';
  let description = '';

  if (purpose === 'SALE') {
    if (!isAllLahore && !isAllTypes) {
      title = `${typeName} for Sale in ${areaName}, Lahore | Lahore Property Hub`;
      description = `Explore verified ${typeName.toLowerCase()} for sale in ${areaName}, Lahore. Check current prices, verified photos, plot and house dimensions, and contact owners or dealers directly on WhatsApp.`;
    } else if (!isAllLahore) {
      title = `Properties for Sale in ${areaName}, Lahore | Lahore Property Hub`;
      description = `Find houses, plots, flats, and commercial properties for sale in ${areaName}, Lahore. Connect directly with authentic owners and licensed realtors with zero buyer fees.`;
    } else if (!isAllTypes) {
      title = `${typeName} for Sale in Lahore | Lahore Property Hub`;
      description = `Browse verified ${typeName.toLowerCase()} for sale across Lahore's premier housing societies: DHA, Bahria Town, Johar Town, Gulberg, and Lake City.`;
    } else {
      title = `Properties for Sale in Lahore | Lahore Property Hub`;
      description = `Browse houses, plots, apartments, and commercial properties for sale in Lahore. Explore DHA, Bahria Town, Gulberg, Johar Town, and all prime sectors.`;
    }
  } else if (purpose === 'RENT') {
    if (!isAllLahore && !isAllTypes) {
      title = `${typeName} for Rent in ${areaName}, Lahore | Lahore Property Hub`;
      description = `Find ${typeName.toLowerCase()} for rent in ${areaName}, Lahore. Verified rental listings with authentic photos, security details, and direct landlord WhatsApp chat.`;
    } else if (!isAllLahore) {
      title = `Properties for Rent in ${areaName}, Lahore | Lahore Property Hub`;
      description = `Find rental houses, apartments, shops, and offices in ${areaName}, Lahore. Direct tenant-to-owner WhatsApp contact without middleman fees.`;
    } else if (!isAllTypes) {
      title = `${typeName} for Rent in Lahore | Lahore Property Hub`;
      description = `Explore rental ${typeName.toLowerCase()} across Lahore including DHA, Bahria Town, Gulberg, Model Town, and Askari. Direct contact with landlords.`;
    } else {
      title = `Properties for Rent in Lahore | Lahore Property Hub`;
      description = `Find houses, apartments, shops, and offices for rent across Lahore. Connect directly with verified owners on WhatsApp.`;
    }
  } else {
    // WANTED
    if (!isAllLahore && !isAllTypes) {
      title = `${typeName} Wanted in ${areaName}, Lahore | Buyer Demands`;
      description = `Browse active buyer and tenant requirements for ${typeName.toLowerCase()} in ${areaName}, Lahore. Connect with verified buyers and investors.`;
    } else if (!isAllLahore) {
      title = `Property Wanted in ${areaName}, Lahore | Buyer & Tenant Requirements`;
      description = `Browse active buyer and tenant property demands in ${areaName}, Lahore. Discover specific requirements for plots, houses, and commercial property.`;
    } else if (!isAllTypes) {
      title = `${typeName} Wanted in Lahore | Buyer Demands`;
      description = `Explore buyer and investor requirements for ${typeName.toLowerCase()} in Lahore.`;
    } else {
      title = `Property Wanted Requirements in Lahore | Lahore Property Hub`;
      description = `Explore buyer and tenant property requests in Lahore. Discover specific demands for plots, houses, and commercial buildings.`;
    }
  }

  // Construct clean canonical URL preserving key indexing parameters (area, type)
  const canonicalParams = new URLSearchParams();
  if (searchParams?.area && searchParams.area !== 'all' && searchParams.area !== 'lahore') {
    canonicalParams.set('area', searchParams.area);
  }
  if (searchParams?.type && searchParams.type !== 'all') {
    canonicalParams.set('type', searchParams.type);
  }

  const queryString = canonicalParams.toString();
  const canonicalUrl = `${siteConfig.url}${basePath}${queryString ? `?${queryString}` : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'en_PK',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
