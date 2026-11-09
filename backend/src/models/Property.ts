import mongoose, { Document, Schema, Model } from 'mongoose';

export type ListingType = 'SALE' | 'RENT' | 'WANTED';

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

export type FurnishedStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FURNISHED';

export type ConstructionStatus = 'READY' | 'UNDER_CONSTRUCTION' | 'RAW';

export type ListingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SOLD'
  | 'RENTED'
  | 'EXPIRED';

export interface IPropertyImage {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export interface IPropertyLocation {
  country: string;
  province: string;
  city: string;
  area: string;
  society?: string;
  block?: string;
  street?: string;
  fullAddress?: string;
}

export interface IPropertyContact {
  contactName: string;
  whatsappNumber: string;
  alternatePhone?: string;
}

export interface IPropertyDetails {
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  floors?: number;
  furnishedStatus?: FurnishedStatus;
  constructionStatus?: ConstructionStatus;
}

export interface IProperty extends Document {
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
  location: IPropertyLocation;
  contactInfo: IPropertyContact;
  facilities: string[];
  details: IPropertyDetails;
  images: IPropertyImage[];
  status: ListingStatus;
  views: number;
  isFeatured: boolean;
  rejectionReason?: string;
  submitterEmail?: string;
  submitterIp?: string;
  spamRisk?: 'LOW' | 'MEDIUM' | 'HIGH';
  spamFlags?: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertyImageSchema = new Schema<IPropertyImage>(
  {
    secureUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    format: { type: String, default: '' },
  },
  { _id: false }
);

const PropertyLocationSchema = new Schema<IPropertyLocation>(
  {
    country: { type: String, default: 'Pakistan' },
    province: { type: String, default: 'Punjab' },
    city: { type: String, default: 'Lahore', required: true, index: true },
    area: { type: String, required: true, index: true },
    society: { type: String, default: '' },
    block: { type: String, default: '' },
    street: { type: String, default: '' },
    fullAddress: { type: String, default: '' },
  },
  { _id: false }
);

const PropertyContactSchema = new Schema<IPropertyContact>(
  {
    contactName: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, trim: true },
    alternatePhone: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const PropertyDetailsSchema = new Schema<IPropertyDetails>(
  {
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    kitchens: { type: Number, min: 0 },
    floors: { type: Number, min: 0 },
    furnishedStatus: {
      type: String,
      enum: ['UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED'],
    },
    constructionStatus: {
      type: String,
      enum: ['READY', 'UNDER_CONSTRUCTION', 'RAW'],
    },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    listingType: {
      type: String,
      required: true,
      enum: ['SALE', 'RENT', 'WANTED'],
      index: true,
    },
    propertyType: {
      type: String,
      required: true,
      enum: [
        'HOUSE',
        'APARTMENT',
        'PLOT',
        'SHOP',
        'OFFICE',
        'COMMERCIAL_BUILDING',
        'WAREHOUSE',
        'OTHER',
      ],
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price must be positive'],
      index: true,
    },
    priceType: {
      type: String,
      default: 'NEGOTIABLE',
      enum: ['FIXED', 'NEGOTIABLE', 'MONTHLY', 'YEARLY'],
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    budgetMin: {
      type: Number,
      min: 0,
    },
    budgetMax: {
      type: Number,
      min: 0,
    },
    areaSize: {
      type: Number,
      required: [true, 'Area size is required'],
      min: [1, 'Area size must be greater than zero'],
    },
    areaUnit: {
      type: String,
      required: true,
      enum: ['MARLA', 'KANAL', 'SQ_FT', 'SQ_YD'],
      default: 'MARLA',
    },
    location: {
      type: PropertyLocationSchema,
      required: true,
    },
    contactInfo: {
      type: PropertyContactSchema,
      required: true,
    },
    facilities: {
      type: [String],
      default: [],
    },
    details: {
      type: PropertyDetailsSchema,
      default: () => ({}),
    },
    images: {
      type: [PropertyImageSchema],
      default: [],
      validate: [
        (val: IPropertyImage[]) => val.length <= 3,
        'Cannot exceed maximum of 3 property images',
      ],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: booleanOrNumberCheck(),
      default: false,
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    submitterEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    submitterIp: {
      type: String,
      default: '',
    },
    spamRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    spamFlags: {
      type: [String],
      default: [],
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

function booleanOrNumberCheck() {
  return Boolean;
}

// Compound indexes for high-performance public property marketplace querying
PropertySchema.index({ status: 1, listingType: 1, createdAt: -1 });
PropertySchema.index({ status: 1, 'location.city': 1, 'location.area': 1, createdAt: -1 });
PropertySchema.index({ status: 1, propertyType: 1, price: 1 });
PropertySchema.index({ status: 1, isFeatured: 1, createdAt: -1 });
PropertySchema.index({ title: 'text', description: 'text' });

export const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
