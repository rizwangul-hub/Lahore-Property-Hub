import {
  ApiProperty,
  PropertyListing,
  SearchFilters,
  ApiResponse,
  PropertyPurpose,
  PropertyCategory,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Adapter function that maps a backend ApiProperty document to the frontend PropertyListing interface.
 */
export const mapApiPropertyToListing = (p: ApiProperty): PropertyListing => {
  const purposeMap: Record<string, PropertyPurpose> = {
    SALE: 'sale',
    RENT: 'rent',
    WANTED: 'wanted',
  };

  const categoryMap: Record<string, PropertyCategory> = {
    HOUSE: 'house',
    APARTMENT: 'apartment',
    PLOT: 'plot',
    SHOP: 'shop',
    OFFICE: 'office',
    COMMERCIAL_BUILDING: 'commercial',
    WAREHOUSE: 'warehouse',
    OTHER: 'other',
  };

  const imageUrls = p.images && p.images.length > 0
    ? p.images.map((img) => img.secureUrl)
    : [];

  return {
    id: p._id || p.id || p.referenceId,
    title: p.title,
    slug: p.slug,
    referenceId: p.referenceId,
    price: p.price || 0,
    priceType: p.priceType,
    currency: p.currency || 'PKR',
    purpose: purposeMap[p.listingType] || 'sale',
    category: categoryMap[p.propertyType] || 'house',
    location: {
      area: p.location?.area || 'Lahore',
      city: p.location?.city || 'Lahore',
      society: p.location?.society,
      block: p.location?.block,
      address: p.location?.fullAddress,
    },
    areaSize: `${p.areaSize} ${p.areaUnit ? p.areaUnit.toLowerCase() : 'marla'}`,
    bedrooms: p.details?.bedrooms,
    bathrooms: p.details?.bathrooms,
    images: imageUrls,
    facilities: p.facilities || [],
    description: p.description,
    isFeatured: Boolean(p.isFeatured),
    createdAt: p.createdAt,
    whatsappContact: p.contactInfo?.whatsappNumber,
    contactName: p.contactInfo?.contactName,
  };
};

/**
 * Fetches approved property listings from the REST API with filters.
 */
export const fetchProperties = async (
  filters: SearchFilters = {}
): Promise<{ properties: PropertyListing[]; total: number; totalPages: number }> => {
  try {
    const params = new URLSearchParams();

    if (filters.listingType) {
      params.set('listingType', filters.listingType);
    } else if (filters.purpose) {
      const p = String(filters.purpose).toUpperCase();
      params.set('listingType', p);
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      params.set('propertyType', String(filters.propertyType).toUpperCase());
    }

    if (filters.area && filters.area !== 'lahore') {
      params.set('area', filters.area);
    } else if (filters.location && filters.location !== 'lahore') {
      params.set('area', filters.location);
    }

    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters.minAreaSize) params.set('minAreaSize', String(filters.minAreaSize));
    if (filters.maxAreaSize) params.set('maxAreaSize', String(filters.maxAreaSize));
    if (filters.bedrooms) params.set('bedrooms', String(filters.bedrooms));
    if (filters.bathrooms) params.set('bathrooms', String(filters.bathrooms));
    if (filters.facilities) params.set('facilities', filters.facilities);
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.featured) params.set('featured', 'true');
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.sort) params.set('sort', filters.sort);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/properties${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 30 }, // ISR 30-second revalidation
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data: ApiResponse<ApiProperty[]> = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return {
        properties: data.data.map(mapApiPropertyToListing),
        total: data.pagination?.total || data.data.length,
        totalPages: data.pagination?.totalPages || 1,
      };
    }

    return { properties: [], total: 0, totalPages: 1 };
  } catch (err) {
    console.warn('[API] Could not reach backend properties endpoint:', err instanceof Error ? err.message : err);
    return { properties: [], total: 0, totalPages: 1 };
  }
};

/**
 * Fetches an approved property by slug.
 */
export const fetchPropertyBySlug = async (
  slug: string
): Promise<PropertyListing | null> => {
  try {
    const url = `${API_BASE_URL}/properties/${encodeURIComponent(slug)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fresh for view count & latest details
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const json: ApiResponse<ApiProperty> = await res.json();
    if (json.success && json.data) {
      return mapApiPropertyToListing(json.data);
    }

    return null;
  } catch (err) {
    console.error(`[API] Failed to fetch property by slug "${slug}":`, err);
    return null;
  }
};

/**
 * Fetches up to 4 similar approved properties.
 */
export const fetchSimilarProperties = async (
  slug: string
): Promise<PropertyListing[]> => {
  try {
    const url = `${API_BASE_URL}/properties/${encodeURIComponent(slug)}/similar`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    const json: ApiResponse<ApiProperty[]> = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(mapApiPropertyToListing);
    }
    return [];
  } catch (err) {
    console.warn(`[API] Could not fetch similar properties for "${slug}":`, err);
    return [];
  }
};

/**
 * Submits a new property advertisement (multipart/form-data with up to 3 images).
 */
export const submitProperty = async (
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  data?: {
    referenceId: string;
    slug: string;
    status: string;
  };
  errors?: string[];
}> => {
  try {
    const url = `${API_BASE_URL}/properties`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      // Do not manually set Content-Type header when passing FormData: the browser sets boundary
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || 'Property submission failed',
        errors: result.errors || [result.message || 'Unknown error occurred'],
      };
    }

    return result;
  } catch (err) {
    return {
      success: false,
      message:
        'Unable to connect to the server. Please verify the backend is running and try again.',
      errors: [err instanceof Error ? err.message : 'Network error'],
    };
  }
};

export interface EnquirySubmissionData {
  propertyId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  preferredContactMethod: 'WHATSAPP' | 'PHONE' | 'EMAIL';
  _hp?: string;
}

/**
 * Submits a customer property enquiry lead.
 */
export const submitPropertyEnquiry = async (
  data: EnquirySubmissionData
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: result.message || 'Failed to submit enquiry. Please verify your details.',
      };
    }

    return {
      success: true,
      message: result.message || 'Your enquiry has been received successfully!',
    };
  } catch {
    return {
      success: false,
      message: 'Network connection error. Please try again in a few moments.',
    };
  }
};

/**
 * Non-blocking marketplace analytics tracking.
 */
export const recordAnalyticsEvent = (event: {
  eventType: 'PAGE_VIEW' | 'WHATSAPP_CLICK' | 'ENQUIRY_SUBMIT';
  propertyId?: string;
  propertySlug?: string;
  visitorSessionId?: string;
  deviceType?: string;
}): void => {
  try {
    if (typeof window === 'undefined') return;

    fetch(`${API_BASE_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silent fail to preserve UX
  }
};

