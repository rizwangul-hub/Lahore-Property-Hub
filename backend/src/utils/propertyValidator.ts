import crypto from 'crypto';
import { ListingType, PropertyType, PriceType, AreaUnit } from '../models/Property.js';

export interface ValidatedPropertyInput {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  priceType: PriceType;
  budgetMin?: number;
  budgetMax?: number;
  areaSize: number;
  areaUnit: AreaUnit;
  location: {
    country: string;
    province: string;
    city: string;
    area: string;
    society?: string;
    block?: string;
    street?: string;
    fullAddress?: string;
  };
  contactInfo: {
    contactName: string;
    whatsappNumber: string;
    alternatePhone?: string;
  };
  facilities: string[];
  details: {
    bedrooms?: number;
    bathrooms?: number;
    kitchens?: number;
    floors?: number;
    furnishedStatus?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';
    constructionStatus?: 'READY' | 'UNDER_CONSTRUCTION' | 'RAW';
  };
}

/**
 * Normalizes a Pakistani phone/WhatsApp number into clean international format (e.g. 923001234567)
 */
export const normalizeWhatsAppNumber = (input: string): string => {
  if (!input) return '';
  // Remove non-digit characters
  let cleaned = input.replace(/\D/g, '');

  // 03001234567 -> 923001234567
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }

  return cleaned;
};

export const isValidPakistaniMobile = (numberStr: string): boolean => {
  const normalized = normalizeWhatsAppNumber(numberStr);
  // Must be 923XXXXXXXXX (12 digits starting with 923)
  return /^923\d{9}$/.test(normalized);
};

export const generatePropertySlug = (title: string): string => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 70);

  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${base || 'property'}-${randomSuffix}`;
};

export const generateReferenceId = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'LPH-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validates and sanitizes raw payload from multipart/form-data or JSON.
 */
export const validatePropertyInput = (raw: Record<string, unknown>): {
  errors: string[];
  data?: ValidatedPropertyInput;
} => {
  const errors: string[] = [];

  // Title
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title || title.length < 5) {
    errors.push('Title is required and must be at least 5 characters');
  } else if (title.length > 140) {
    errors.push('Title cannot exceed 140 characters');
  }

  // Description
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  if (!description || description.length < 10) {
    errors.push('Description is required and must be at least 10 characters');
  }

  // Listing Type
  const allowedListingTypes: ListingType[] = ['SALE', 'RENT', 'WANTED'];
  const listingType = (typeof raw.listingType === 'string'
    ? raw.listingType.toUpperCase()
    : '') as ListingType;
  if (!allowedListingTypes.includes(listingType)) {
    errors.push('Listing type must be SALE, RENT, or WANTED');
  }

  // Property Type
  const allowedPropertyTypes: PropertyType[] = [
    'HOUSE',
    'APARTMENT',
    'PLOT',
    'SHOP',
    'OFFICE',
    'COMMERCIAL_BUILDING',
    'WAREHOUSE',
    'OTHER',
  ];
  const propertyType = (typeof raw.propertyType === 'string'
    ? raw.propertyType.toUpperCase()
    : '') as PropertyType;
  if (!allowedPropertyTypes.includes(propertyType)) {
    errors.push(`Property type must be one of: ${allowedPropertyTypes.join(', ')}`);
  }

  // Price / Budgets
  let price = 0;
  let budgetMin: number | undefined;
  let budgetMax: number | undefined;

  if (listingType === 'WANTED') {
    if (raw.budgetMin !== undefined && raw.budgetMin !== '') {
      budgetMin = Number(raw.budgetMin);
      if (isNaN(budgetMin) || budgetMin < 0) errors.push('Minimum budget must be a positive number');
    }
    if (raw.budgetMax !== undefined && raw.budgetMax !== '') {
      budgetMax = Number(raw.budgetMax);
      if (isNaN(budgetMax) || budgetMax < 0) errors.push('Maximum budget must be a positive number');
    }
    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      errors.push('Minimum budget cannot exceed maximum budget');
    }
  } else {
    price = Number(raw.price);
    if (isNaN(price) || price < 0) {
      errors.push('Valid positive price in PKR is required for sale/rent listings');
    }
  }

  // Price Type
  const allowedPriceTypes: PriceType[] = ['FIXED', 'NEGOTIABLE', 'MONTHLY', 'YEARLY'];
  let priceType = (typeof raw.priceType === 'string'
    ? raw.priceType.toUpperCase()
    : 'NEGOTIABLE') as PriceType;
  if (!allowedPriceTypes.includes(priceType)) {
    priceType = 'NEGOTIABLE';
  }

  // Area Size & Unit
  const areaSize = Number(raw.areaSize);
  if (isNaN(areaSize) || areaSize <= 0) {
    errors.push('Area size must be a number greater than 0');
  }

  const allowedUnits: AreaUnit[] = ['MARLA', 'KANAL', 'SQ_FT', 'SQ_YD'];
  const areaUnit = (typeof raw.areaUnit === 'string'
    ? raw.areaUnit.toUpperCase()
    : 'MARLA') as AreaUnit;
  if (!allowedUnits.includes(areaUnit)) {
    errors.push('Area unit must be MARLA, KANAL, SQ_FT, or SQ_YD');
  }

  // Location
  let rawLocation: Record<string, unknown> = {};
  if (typeof raw.location === 'object' && raw.location !== null) {
    rawLocation = raw.location as Record<string, unknown>;
  } else if (typeof raw.location === 'string') {
    try {
      rawLocation = JSON.parse(raw.location || '{}');
    } catch {
      rawLocation = {};
    }
  }

  const city = typeof rawLocation.city === 'string' && rawLocation.city.trim()
    ? rawLocation.city.trim()
    : 'Lahore';
  const area = typeof rawLocation.area === 'string' && rawLocation.area.trim()
    ? rawLocation.area.trim()
    : (typeof raw.area === 'string' ? raw.area.trim() : '');

  if (!area) {
    errors.push('Location area or society is required');
  }

  const society = typeof rawLocation.society === 'string' ? rawLocation.society.trim() : '';
  const block = typeof rawLocation.block === 'string' ? rawLocation.block.trim() : '';
  const street = typeof rawLocation.street === 'string' ? rawLocation.street.trim() : '';
  const fullAddress = typeof rawLocation.fullAddress === 'string' ? rawLocation.fullAddress.trim() : '';

  // Contact Info
  let rawContact: Record<string, unknown> = {};
  if (typeof raw.contactInfo === 'object' && raw.contactInfo !== null) {
    rawContact = raw.contactInfo as Record<string, unknown>;
  } else if (typeof raw.contactInfo === 'string') {
    try {
      rawContact = JSON.parse(raw.contactInfo || '{}');
    } catch {
      rawContact = {};
    }
  }

  const contactName = (typeof rawContact.contactName === 'string'
    ? rawContact.contactName.trim()
    : typeof raw.contactName === 'string'
    ? raw.contactName.trim()
    : '');

  if (!contactName || contactName.length < 2) {
    errors.push('Contact name is required');
  }

  const rawWhatsapp = (typeof rawContact.whatsappNumber === 'string'
    ? rawContact.whatsappNumber.trim()
    : typeof raw.whatsappNumber === 'string'
    ? raw.whatsappNumber.trim()
    : '');

  if (!rawWhatsapp) {
    errors.push('WhatsApp number is required');
  } else if (!isValidPakistaniMobile(rawWhatsapp)) {
    errors.push('Valid Pakistani WhatsApp number is required (e.g. 03001234567 or 923001234567)');
  }
  const whatsappNumber = normalizeWhatsAppNumber(rawWhatsapp);

  const alternatePhone = (typeof rawContact.alternatePhone === 'string'
    ? rawContact.alternatePhone.trim()
    : typeof raw.alternatePhone === 'string'
    ? raw.alternatePhone.trim()
    : '');

  // Facilities
  let facilities: string[] = [];
  if (Array.isArray(raw.facilities)) {
    facilities = raw.facilities.map((f) => String(f).trim()).filter(Boolean);
  } else if (typeof raw.facilities === 'string') {
    try {
      const parsed = JSON.parse(raw.facilities);
      if (Array.isArray(parsed)) {
        facilities = parsed.map((f) => String(f).trim()).filter(Boolean);
      }
    } catch {
      facilities = raw.facilities.split(',').map((f) => f.trim()).filter(Boolean);
    }
  }

  // Details
  let rawDetails: Record<string, unknown> = {};
  if (typeof raw.details === 'object' && raw.details !== null) {
    rawDetails = raw.details as Record<string, unknown>;
  } else if (typeof raw.details === 'string') {
    try {
      rawDetails = JSON.parse(raw.details || '{}');
    } catch {
      rawDetails = {};
    }
  }

  const details: ValidatedPropertyInput['details'] = {};
  if (rawDetails.bedrooms !== undefined && rawDetails.bedrooms !== '') {
    details.bedrooms = Math.max(0, parseInt(String(rawDetails.bedrooms), 10) || 0);
  }
  if (rawDetails.bathrooms !== undefined && rawDetails.bathrooms !== '') {
    details.bathrooms = Math.max(0, parseInt(String(rawDetails.bathrooms), 10) || 0);
  }
  if (rawDetails.kitchens !== undefined && rawDetails.kitchens !== '') {
    details.kitchens = Math.max(0, parseInt(String(rawDetails.kitchens), 10) || 0);
  }
  if (rawDetails.floors !== undefined && rawDetails.floors !== '') {
    details.floors = Math.max(0, parseInt(String(rawDetails.floors), 10) || 0);
  }
  if (typeof rawDetails.furnishedStatus === 'string') {
    const fs = rawDetails.furnishedStatus.toUpperCase();
    if (['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'].includes(fs)) {
      details.furnishedStatus = fs as 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';
    }
  }
  if (typeof rawDetails.constructionStatus === 'string') {
    const cs = rawDetails.constructionStatus.toUpperCase();
    if (['READY', 'UNDER_CONSTRUCTION', 'RAW'].includes(cs)) {
      details.constructionStatus = cs as 'READY' | 'UNDER_CONSTRUCTION' | 'RAW';
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors: [],
    data: {
      title,
      description,
      listingType,
      propertyType,
      price,
      priceType,
      budgetMin,
      budgetMax,
      areaSize,
      areaUnit,
      location: {
        country: 'Pakistan',
        province: 'Punjab',
        city,
        area,
        society,
        block,
        street,
        fullAddress,
      },
      contactInfo: {
        contactName,
        whatsappNumber,
        alternatePhone,
      },
      facilities,
      details,
    },
  };
};
