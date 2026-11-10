import { config } from '../config/index.js';

export interface ImageTransformationOptions {
  aspectRatio?: 'SQUARE_1080' | 'LANDSCAPE_1200' | 'ORIGINAL';
  watermark?: boolean;
  watermarkText?: string;
  quality?: 'auto' | 'high';
}

/**
 * Transforms an existing Cloudinary property photo URL without altering or overwriting the original file.
 * Applies Cloudinary on-the-fly transformations:
 * - Square 1080x1080 for Facebook feed posts
 * - Landscape 1200x630 for Facebook links/shares
 * - Automatic WebP/JPEG format negotiation and compression (f_auto,q_auto)
 * - Optional discrete corner watermark badge ("Lahore Property Hub")
 */
export function transformPropertyPhotoUrl(
  originalUrl: string,
  options: ImageTransformationOptions = {}
): string {
  if (!originalUrl || !originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }

  const {
    aspectRatio = 'LANDSCAPE_1200',
    watermark = true,
    watermarkText = 'Property in Lahore | Verified',
  } = options;

  // Split URL at "/upload/"
  const uploadIndex = originalUrl.indexOf('/upload/');
  if (uploadIndex === -1) {
    return originalUrl;
  }

  const prefix = originalUrl.substring(0, uploadIndex + '/upload/'.length);
  const rest = originalUrl.substring(uploadIndex + '/upload/'.length);

  // If already has transformation segment, strip it to avoid chaining duplicate crops
  const cleanRest = rest.replace(/^(c_[^/]+\/)+/, '');

  const transformParts: string[] = [];

  // Dimensions & Crop
  if (aspectRatio === 'SQUARE_1080') {
    transformParts.push('c_fill,w_1080,h_1080,g_auto');
  } else if (aspectRatio === 'LANDSCAPE_1200') {
    transformParts.push('c_fill,w_1200,h_630,g_auto');
  }

  // Quality & Format Optimization
  transformParts.push('f_auto,q_auto:good');

  // Optional Watermark Overlay
  if (watermark) {
    const safeText = encodeURIComponent(watermarkText);
    transformParts.push(`l_text:Arial_22_bold:${safeText},co_rgb:ffffff,o_85,g_south_east,x_25,y_25`);
  }

  const transformationString = transformParts.join('/');
  return `${prefix}${transformationString}/${cleanRest}`;
}

/**
 * Builds high-converting branded website promotional banners for Engine 1.
 * Matches theme to curated, high-resolution architectural backdrops with official brand overlays.
 */
export function getBrandedWebsiteBanner(
  theme: string,
  targetArea?: string
): string {
  const areaLabel = targetArea && targetArea !== 'All Lahore' ? targetArea : 'Lahore';

  const THEME_BANNERS: Record<string, string> = {
    FREE_PROPERTY_LISTINGS:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80',
    LANDLORD_RENTAL:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&h=630&q=80',
    DEALER_PARTNERSHIPS:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80',
    BUYER_DISCOVERY:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=630&q=80',
    TENANT_DISCOVERY:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&h=630&q=80',
    SOCIETY_SPOTLIGHT:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&h=630&q=80',
  };

  return (
    THEME_BANNERS[theme] ||
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80'
  );
}

/**
 * Generates an array of promotional images for a marketing draft:
 * Includes square format for mobile feeds and landscape format for wide link cards.
 */
export function preparePropertyMarketingAssets(
  rawImageUrls: string[]
): { squareUrls: string[]; landscapeUrls: string[]; primaryUrls: string[] } {
  if (!rawImageUrls || rawImageUrls.length === 0) {
    return {
      squareUrls: [],
      landscapeUrls: [],
      primaryUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80',
      ],
    };
  }

  const squareUrls = rawImageUrls.map((url) =>
    transformPropertyPhotoUrl(url, { aspectRatio: 'SQUARE_1080', watermark: true })
  );

  const landscapeUrls = rawImageUrls.map((url) =>
    transformPropertyPhotoUrl(url, { aspectRatio: 'LANDSCAPE_1200', watermark: true })
  );

  return {
    squareUrls,
    landscapeUrls,
    primaryUrls: landscapeUrls,
  };
}
