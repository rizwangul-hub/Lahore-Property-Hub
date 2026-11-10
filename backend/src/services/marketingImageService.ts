import { config } from '../config/index.js';

export interface ImageTransformationOptions {
  aspectRatio?: 'SQUARE_1080' | 'LANDSCAPE_1200' | 'ORIGINAL';
  watermark?: boolean;
  watermarkText?: string;
  badgeText?: string;
  priceBadge?: string;
  areaBadge?: string;
  quality?: 'auto' | 'high';
}

/**
 * Transforms an existing Cloudinary property photo URL into a premium marketing poster.
 * Applies Cloudinary on-the-fly transformations:
 * - Square 1080x1080 for Facebook feed posts
 * - Landscape 1200x630 for Facebook links/shares
 * - Top-left official badge: "Property in Lahore"
 * - Bottom banner: Price and Area specs
 * - Automatic WebP/JPEG format negotiation and compression (f_auto,q_auto)
 */
export function transformPropertyPhotoUrl(
  originalUrl: string,
  options: ImageTransformationOptions = {}
): string {
  if (!originalUrl || !originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }

  const {
    aspectRatio = 'SQUARE_1080',
    watermark = true,
    watermarkText = 'Property in Lahore',
    priceBadge,
    areaBadge,
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

  // 1. Dimensions & Crop (1080x1080 square poster default)
  if (aspectRatio === 'SQUARE_1080') {
    transformParts.push('c_fill,w_1080,h_1080,g_auto');
  } else if (aspectRatio === 'LANDSCAPE_1200') {
    transformParts.push('c_fill,w_1200,h_630,g_auto');
  }

  // 2. Format & Quality
  transformParts.push('f_auto,q_auto:good');

  // 3. Top-Left Premium Brand Ribbon / Badge: "Property in Lahore"
  if (watermark) {
    const brandLabel = encodeURIComponent(watermarkText);
    transformParts.push(`l_text:Arial_22_bold:${brandLabel},co_rgb:ffffff,b_rgb:061a3a,o_90,g_north_west,x_35,y_35`);

    // 4. Bottom Specs / Price Banner (if provided)
    const detailParts: string[] = [];
    if (priceBadge) detailParts.push(priceBadge);
    if (areaBadge) detailParts.push(areaBadge);

    if (detailParts.length > 0) {
      const specsText = encodeURIComponent(detailParts.join(' | '));
      transformParts.push(`l_text:Arial_24_bold:${specsText},co_rgb:ffffff,b_rgb:059669,o_95,g_south_west,x_35,y_35`);
    } else {
      // Verified Badge
      const verifiedText = encodeURIComponent('Verified Listing | propertyinlahore.online');
      transformParts.push(`l_text:Arial_22_bold:${verifiedText},co_rgb:ffffff,b_rgb:061a3a,o_85,g_south_west,x_35,y_35`);
    }
  }

  const transformationString = transformParts.join('/');
  return `${prefix}${transformationString}/${cleanRest}`;
}

/**
 * Builds high-converting branded website promotional banners for Engine 1.
 * Rotates between your custom branded posters (/poster1.png, /poster2.png)
 * and theme-based architectural backdrops.
 */
export function getBrandedWebsiteBanner(
  theme: string,
  targetArea?: string,
  index = 0
): string {
  const websiteBase = (config.frontendUrl || 'https://www.propertyinlahore.online').replace(/\/$/, '');

  // Custom User Posters in frontend/public:
  const CUSTOM_POSTERS = [
    `${websiteBase}/poster1.png`,
    `${websiteBase}/poster2.png`,
  ];

  // Alternates between poster1.png and poster2.png based on index / day
  if (CUSTOM_POSTERS.length > 0) {
    const posterIndex = Math.abs(index) % CUSTOM_POSTERS.length;
    return CUSTOM_POSTERS[posterIndex];
  }

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
    `${websiteBase}/poster1.png`
  );
}

/**
 * Generates an array of promotional images for a marketing draft:
 * Includes square format for mobile feeds and landscape format for wide link cards.
 */
export function preparePropertyMarketingAssets(
  rawImageUrls: string[],
  meta?: { priceText?: string; areaText?: string }
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
    transformPropertyPhotoUrl(url, {
      aspectRatio: 'SQUARE_1080',
      watermark: true,
      priceBadge: meta?.priceText,
      areaBadge: meta?.areaText,
    })
  );

  const landscapeUrls = rawImageUrls.map((url) =>
    transformPropertyPhotoUrl(url, {
      aspectRatio: 'LANDSCAPE_1200',
      watermark: true,
      priceBadge: meta?.priceText,
      areaBadge: meta?.areaText,
    })
  );

  return {
    squareUrls,
    landscapeUrls,
    primaryUrls: squareUrls, // Primary is now the high-impact Square Poster for mobile Facebook feeds!
  };
}
