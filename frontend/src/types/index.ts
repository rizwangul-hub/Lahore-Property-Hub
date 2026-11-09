export type PropertyPurpose = 'sale' | 'rent' | 'wanted';
export type ListingType = 'SALE' | 'RENT' | 'WANTED';

export type PropertyCategory =
  | 'house'
  | 'apartment'
  | 'plot'
  | 'shop'
  | 'office'
  | 'commercial'
  | 'warehouse'
  | 'other'
  | 'portion';

export type PropertyType =
  | 'HOUSE'
  | 'APARTMENT'
  | 'PLOT'
  | 'SHOP'
  | 'OFFICE'
  | 'COMMERCIAL_BUILDING'
  | 'WAREHOUSE'
  | 'OTHER';

export type PriceType = 'FIXED' | 'NEGOTIABLE' | 'MONTHLY' | 'YEARLY';
export type AreaUnit = 'MARLA' | 'KANAL' | 'SQ_FT' | 'SQ_YD';
export type ListingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'
  | 'EXPIRED';

export interface PropertyImage {
  secureUrl: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface PropertyLocation {
  country: string;
  province: string;
  city: string;
  area: string;
  society?: string;
  block?: string;
  street?: string;
  fullAddress?: string;
}

export interface PropertyContact {
  contactName: string;
  whatsappNumber: string;
  alternatePhone?: string;
}

export interface PropertyDetails {
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  floors?: number;
  furnishedStatus?: 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';
  constructionStatus?: 'READY' | 'UNDER_CONSTRUCTION' | 'RAW';
}

export interface ApiProperty {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  referenceId: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  price: number;
  priceType: PriceType;
  currency: string;
  budgetMin?: number;
  budgetMax?: number;
  areaSize: number;
  areaUnit: AreaUnit;
  location: PropertyLocation;
  contactInfo: PropertyContact;
  facilities: string[];
  details: PropertyDetails;
  images: PropertyImage[];
  status: ListingStatus;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListing {
  id: string;
  title: string;
  slug: string;
  referenceId?: string;
  price: number;
  priceType?: PriceType;
  currency: string;
  purpose: PropertyPurpose;
  category: PropertyCategory;
  location: {
    area: string;
    city: string;
    society?: string;
    block?: string;
    address?: string;
  };
  areaSize: string;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  facilities?: string[];
  description?: string;
  isFeatured?: boolean;
  createdAt: string;
  whatsappContact?: string;
  contactName?: string;
}

export interface SearchFilters {
  purpose?: PropertyPurpose | ListingType;
  listingType?: ListingType;
  location?: string;
  area?: string;
  propertyType?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  minAreaSize?: string | number;
  maxAreaSize?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  facilities?: string;
  keyword?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'views';
}

export interface AreaItem {
  name: string;
  slug: string;
  city: string;
  image: string;
  tagline: string;
  featured?: boolean;
}

export interface CategoryItem {
  title: string;
  slug: string;
  iconName: string;
  description: string;
  href: string;
}

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  tag: string;
  alt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: string[];
}

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CONVERTED' | 'CLOSED';
export type PreferredContactMethod = 'WHATSAPP' | 'PHONE' | 'EMAIL';

export interface EnquiryItem {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    slug: string;
    referenceId?: string;
    price?: number;
    location?: PropertyLocation;
    images?: PropertyImage[];
    status?: string;
    contactInfo?: PropertyContact;
  } | string;
  propertyTitle: string;
  propertyReferenceId?: string;
  listingType: string;
  propertyOwnerWhatsapp?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  preferredContactMethod: PreferredContactMethod;
  status: EnquiryStatus;
  adminNotes?: string;
  isSpam?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  type: 'PROPERTY_SUBMITTED' | 'ENQUIRY_RECEIVED' | 'MODERATION_ACTION' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  propertyId?: string;
  enquiryId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsTrendItem {
  date: string;
  views: number;
  whatsappClicks: number;
  enquiries: number;
}

export interface AnalyticsData {
  summary: {
    totalViews: number;
    totalWhatsAppClicks: number;
    totalEnquiries: number;
    conversionRate: number;
  };
  topViewedProperties: ApiProperty[];
  enquiriesByListingType: { type: string; count: number }[];
  trends: AnalyticsTrendItem[];
}
