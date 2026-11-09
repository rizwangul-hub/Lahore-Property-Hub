/**
 * Lightweight, privacy-first client analytics event tracking helper.
 * Ready for integration with Google Tag Manager / GA4 / Plausible in future phases.
 */

export interface AnalyticsEventPayload {
  propertyId?: string;
  propertySlug?: string;
  referenceId?: string;
  category?: string;
  purpose?: string;
  area?: string;
  price?: number;
  searchQuery?: Record<string, unknown>;
  [key: string]: unknown;
}

export const trackEvent = (
  eventName:
    | 'property_view'
    | 'property_search'
    | 'whatsapp_contact_click'
    | 'category_select'
    | 'property_submit_attempt'
    | 'property_submit_success',
  payload?: AnalyticsEventPayload
): void => {
  if (typeof window === 'undefined') return;

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${eventName}:`, payload);
  }

  // Support dataLayer if configured by user
  if (Array.isArray((window as unknown as { dataLayer?: unknown[] }).dataLayer)) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push({
      event: eventName,
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
};
