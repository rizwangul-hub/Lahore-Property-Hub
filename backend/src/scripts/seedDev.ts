import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Property } from '../models/Property.js';
import { generatePropertySlug, generateReferenceId } from '../utils/propertyValidator.js';

const seedDevelopmentData = async () => {
  // Strict production safeguard: NEVER run in production!
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: Seed script execution is strictly forbidden in production!');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not configured in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB for development seeding...');
  await mongoose.connect(mongoUri);

  const sampleProperties = [
    {
      title: '5 Marla Modern Luxury Villa in Sector C, Bahria Town',
      description: 'Brand new state of the art 5 Marla villa in Sector C Bahria Town Lahore. Designed with imported Spanish porcelain tiles, bespoke kitchen cabinets, fall ceilings, and high security fixtures.',
      listingType: 'SALE',
      propertyType: 'HOUSE',
      price: 24000000,
      priceType: 'NEGOTIABLE',
      currency: 'PKR',
      areaSize: 5,
      areaUnit: 'MARLA',
      location: {
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        area: 'Bahria Town',
        society: 'Bahria Town Sector C',
        block: 'Block N',
        fullAddress: 'Sector C, Bahria Town, Lahore',
      },
      contactInfo: {
        contactName: 'Chaudhry Real Estate Advisors',
        whatsappNumber: '+923001234567',
      },
      facilities: ['Electricity', 'Water', 'Gas', 'Security', 'Sewerage'],
      details: {
        bedrooms: 3,
        bathrooms: 4,
        kitchens: 1,
        floors: 2,
        furnishedStatus: 'UNFURNISHED',
        constructionStatus: 'READY',
      },
      images: [
        {
          secureUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
          publicId: 'dev_sample_bahria_1',
          width: 1920,
          height: 1080,
          format: 'jpg',
        },
      ],
      status: 'APPROVED',
      isFeatured: true,
      views: 142,
    },
    {
      title: '1 Kanal Architectural Masterpiece in DHA Phase 5',
      description: 'Luxurious 1 Kanal executive bungalow in DHA Phase 5 Lahore. Features 5 master bedrooms, 2 designer kitchens, basement entertainment suite, servant quarters, and lush landscaped garden.',
      listingType: 'SALE',
      propertyType: 'HOUSE',
      price: 95000000,
      priceType: 'FIXED',
      currency: 'PKR',
      areaSize: 1,
      areaUnit: 'KANAL',
      location: {
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        area: 'DHA Defence',
        society: 'DHA Phase 5',
        block: 'Block G',
        fullAddress: 'DHA Phase 5, Lahore Cantt',
      },
      contactInfo: {
        contactName: 'Premier Housing Consultants',
        whatsappNumber: '+923219876543',
      },
      facilities: ['Electricity', 'Water', 'Gas', 'Security', 'Internet', 'Sewerage'],
      details: {
        bedrooms: 5,
        bathrooms: 6,
        kitchens: 2,
        floors: 2,
        furnishedStatus: 'SEMI_FURNISHED',
        constructionStatus: 'READY',
      },
      images: [
        {
          secureUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
          publicId: 'dev_sample_dha5_1',
          width: 1920,
          height: 1080,
          format: 'jpg',
        },
      ],
      status: 'APPROVED',
      isFeatured: true,
      views: 310,
    },
    {
      title: '2 Bed Luxury Furnished Apartment in Gulberg III',
      description: 'Contemporary high-rise corner apartment with panoramic skyline views of Lahore. Fully furnished with Italian sofas, inverter air-conditioners, smart home access, and allocated covered car parking.',
      listingType: 'RENT',
      propertyType: 'APARTMENT',
      price: 185000,
      priceType: 'MONTHLY',
      currency: 'PKR',
      areaSize: 1250,
      areaUnit: 'SQ_FT',
      location: {
        country: 'Pakistan',
        province: 'Punjab',
        city: 'Lahore',
        area: 'Gulberg',
        society: 'Gulberg III',
        block: 'Near MM Alam Road',
        fullAddress: 'Gulberg III, Main MM Alam Avenue, Lahore',
      },
      contactInfo: {
        contactName: 'Gulberg Luxury Living Management',
        whatsappNumber: '+923334567890',
      },
      facilities: ['Electricity', 'Water', 'Gas', 'Security', 'Internet', 'Elevator', 'Gym'],
      details: {
        bedrooms: 2,
        bathrooms: 2,
        kitchens: 1,
        floors: 1,
        furnishedStatus: 'FURNISHED',
        constructionStatus: 'READY',
      },
      images: [
        {
          secureUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
          publicId: 'dev_sample_gulberg_1',
          width: 1920,
          height: 1080,
          format: 'jpg',
        },
      ],
      status: 'APPROVED',
      isFeatured: false,
      views: 89,
    },
  ];

  for (const item of sampleProperties) {
    const slug = generatePropertySlug(item.title);
    const referenceId = generateReferenceId();

    const existing = await Property.findOne({ title: item.title });
    if (!existing) {
      await Property.create({
        ...item,
        slug,
        referenceId,
      });
      console.log(`✅ Seeded development property: ${item.title} (${referenceId})`);
    } else {
      console.log(`ℹ️ Property already exists: ${item.title}`);
    }
  }

  console.log('✨ Development seeding completed successfully.');
  await mongoose.disconnect();
  process.exit(0);
};

seedDevelopmentData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
