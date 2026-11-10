import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  const rawBase = siteConfig.url.replace(/\/$/, '');
  const baseUrl =
    rawBase.includes('localhost') && process.env.NODE_ENV !== 'development'
      ? 'https://www.propertyinlahore.online'
      : rawBase;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/post-property',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
