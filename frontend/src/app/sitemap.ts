import { MetadataRoute } from 'next';
import { siteConfig, LAHORE_AREAS } from '@/config/site';
import { fetchProperties } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, '');

  // 1. Core Static Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties-for-sale/lahore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/properties-for-rent/lahore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/property-wanted/lahore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/post-property`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Location Landing Pages (e.g. /properties/bahria-town-lahore)
  const locationRoutes: MetadataRoute.Sitemap = LAHORE_AREAS.map((area) => ({
    url: `${baseUrl}/properties/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 3. Category Landing Pages (e.g. /properties/category/houses)
  const categorySlugs = ['houses', 'apartments', 'plots', 'shops', 'offices', 'commercial'];
  const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((cat) => ({
    url: `${baseUrl}/properties/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 4. Approved Property Listings from MongoDB
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const { properties } = await fetchProperties({ limit: 100 });
    propertyRoutes = properties.map((p) => ({
      url: `${baseUrl}/property/${p.slug}`,
      lastModified: new Date(p.createdAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.75,
    }));
  } catch (err) {
    console.warn('[Sitemap] Could not fetch dynamic properties for sitemap:', err);
  }

  return [...staticRoutes, ...locationRoutes, ...categoryRoutes, ...propertyRoutes];
}
