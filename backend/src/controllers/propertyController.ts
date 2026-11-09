import { Request, Response, NextFunction } from 'express';
import { Property, IPropertyImage } from '../models/Property.js';
import { Notification } from '../models/Notification.js';
import {
  validatePropertyInput,
  generatePropertySlug,
  generateReferenceId,
} from '../utils/propertyValidator.js';
import {
  uploadImageBuffer,
  cleanupUploadedImages,
  isCloudinaryConfigured,
} from '../services/cloudinaryService.js';
import {
  detectSpam,
  checkDuplicatePropertySubmission,
  normalizePhoneNumber,
} from '../utils/antiSpam.js';
import { notifyAdminNewProperty } from '../services/emailService.js';

export const LAHORE_AREAS_LIST = [
  'Bahria Town',
  'Johar Town',
  'DHA Defence',
  'Gulberg',
  'Wapda Town',
  'Model Town',
  'Raiwind Road',
  'Lahore Cantt',
  'Faisal Town',
  'Township',
  'Allama Iqbal Town',
  'Maraka',
  'Askari',
  'Lake City',
  'State Life',
  'Valencia',
  'Izmir Town',
  'Paragon City',
];

export const PROPERTY_CATEGORIES_LIST = [
  { id: 'HOUSE', label: 'House' },
  { id: 'APARTMENT', label: 'Apartment' },
  { id: 'PLOT', label: 'Plot' },
  { id: 'SHOP', label: 'Shop' },
  { id: 'OFFICE', label: 'Office' },
  { id: 'COMMERCIAL_BUILDING', label: 'Commercial Building' },
  { id: 'WAREHOUSE', label: 'Warehouse' },
  { id: 'OTHER', label: 'Other' },
];

/**
 * GET /api/properties
 * Public endpoint: Returns APPROVED property listings with pagination, filtering & sorting.
 */
export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      listingType,
      propertyType,
      city,
      area,
      society,
      block,
      minPrice,
      maxPrice,
      minAreaSize,
      maxAreaSize,
      bedrooms,
      bathrooms,
      facilities,
      keyword,
      featured,
      page = '1',
      limit = '12',
      sort = 'newest',
    } = req.query;

    // Base filter: Only APPROVED properties are returned publicly
    const query: Record<string, unknown> = {
      status: 'APPROVED',
    };

    // Filter by Listing Type (SALE, RENT, WANTED)
    if (listingType && typeof listingType === 'string') {
      const lt = listingType.toUpperCase();
      if (['SALE', 'RENT', 'WANTED'].includes(lt)) {
        query.listingType = lt;
      }
    }

    // Filter by Property Type
    if (propertyType && typeof propertyType === 'string') {
      const pt = propertyType.toUpperCase();
      if (pt !== 'ALL') {
        query.propertyType = pt;
      }
    }

    // Filter by City
    if (city && typeof city === 'string' && city.trim()) {
      query['location.city'] = new RegExp(`^${city.trim()}$`, 'i');
    }

    // Filter by Area / Society
    if (area && typeof area === 'string' && area.trim()) {
      const cleanArea = area.trim().replace(/-/g, ' ');
      query.$or = [
        { 'location.area': new RegExp(cleanArea, 'i') },
        { 'location.society': new RegExp(cleanArea, 'i') },
      ];
    } else if (society && typeof society === 'string' && society.trim()) {
      query['location.society'] = new RegExp(society.trim(), 'i');
    }

    if (block && typeof block === 'string' && block.trim()) {
      query['location.block'] = new RegExp(block.trim(), 'i');
    }

    // Price filtering
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        priceFilter.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        priceFilter.$lte = Number(maxPrice);
      }
      if (Object.keys(priceFilter).length > 0) {
        query.price = priceFilter;
      }
    }

    // Area size filtering
    if (minAreaSize || maxAreaSize) {
      const areaFilter: Record<string, number> = {};
      if (minAreaSize && !isNaN(Number(minAreaSize))) {
        areaFilter.$gte = Number(minAreaSize);
      }
      if (maxAreaSize && !isNaN(Number(maxAreaSize))) {
        areaFilter.$lte = Number(maxAreaSize);
      }
      if (Object.keys(areaFilter).length > 0) {
        query.areaSize = areaFilter;
      }
    }

    // Area Unit filtering
    if (req.query.areaUnit && typeof req.query.areaUnit === 'string') {
      const unit = req.query.areaUnit.toUpperCase();
      if (['MARLA', 'KANAL', 'SQ_FT', 'SQ_YD'].includes(unit)) {
        query.areaUnit = unit;
      }
    }

    // Bedrooms & Bathrooms
    if (bedrooms && !isNaN(Number(bedrooms))) {
      query['details.bedrooms'] = { $gte: Number(bedrooms) };
    }
    if (bathrooms && !isNaN(Number(bathrooms))) {
      query['details.bathrooms'] = { $gte: Number(bathrooms) };
    }

    // Facilities (must contain all specified facilities)
    if (facilities) {
      const facList = typeof facilities === 'string'
        ? facilities.split(',').map((f) => f.trim())
        : Array.isArray(facilities)
        ? (facilities as string[]).map((f) => String(f).trim())
        : [];
      if (facList.length > 0) {
        query.facilities = { $all: facList };
      }
    }

    // Featured filter
    if (featured === 'true' || featured === '1') {
      query.isFeatured = true;
    }

    // Keyword search across title and description
    if (keyword && typeof keyword === 'string' && keyword.trim()) {
      const kw = keyword.trim();
      const kwRegex = new RegExp(kw, 'i');
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [{ title: kwRegex }, { description: kwRegex }] },
        ];
        delete query.$or;
      } else {
        query.$or = [{ title: kwRegex }, { description: kwRegex }];
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1, createdAt: -1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'featured') {
      sortOptions = { isFeatured: -1, createdAt: -1 };
    } else if (sort === 'views') {
      sortOptions = { views: -1, createdAt: -1 };
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-rejectionReason -__v')
        .lean(),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties/:slug
 * Public endpoint: Returns approved property details by slug and increments views safely.
 */
export const getPropertyBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid property slug',
      });
      return;
    }

    // Increment views safely and fetch only if APPROVED
    const property = await Property.findOneAndUpdate(
      { slug: slug.toLowerCase().trim(), status: 'APPROVED' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .select('-rejectionReason -__v')
      .lean();

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found or is currently unavailable',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/properties/:slug/similar
 * Returns up to 4 similar approved properties matching area, category, or purpose.
 */
export const getSimilarProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid property slug',
      });
      return;
    }

    const currentProperty = await Property.findOne({
      slug: slug.toLowerCase().trim(),
      status: 'APPROVED',
    }).lean();

    if (!currentProperty) {
      res.status(404).json({
        success: false,
        message: 'Property not found',
      });
      return;
    }

    // Match similar properties by same area, propertyType, or listingType
    const similar = await Property.find({
      status: 'APPROVED',
      slug: { $ne: currentProperty.slug },
      $or: [
        { 'location.area': currentProperty.location?.area },
        { propertyType: currentProperty.propertyType },
        { listingType: currentProperty.listingType },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('-rejectionReason -__v')
      .lean();

    res.status(200).json({
      success: true,
      data: similar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/properties
 * Public property submission endpoint.
 * Accepts multipart/form-data (up to 3 images) or JSON.
 * Validates, uploads images to Cloudinary, creates property with status 'PENDING'.
 */
export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const uploadedCloudinaryImages: IPropertyImage[] = [];

  try {
    const rawPayload = { ...req.body };

    // Run deep backend validation & sanitization
    const validationResult = validatePropertyInput(rawPayload);
    if (validationResult.errors.length > 0 || !validationResult.data) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.errors,
      });
      return;
    }

    const { data } = validationResult;

    // Normalize contact phone
    data.contactInfo.whatsappNumber = normalizePhoneNumber(data.contactInfo.whatsappNumber);
    if (data.contactInfo.alternatePhone) {
      data.contactInfo.alternatePhone = normalizePhoneNumber(data.contactInfo.alternatePhone);
    }

    // 1. Duplicate submission check
    const isDuplicate = await checkDuplicatePropertySubmission(
      data.contactInfo.whatsappNumber,
      data.title
    );
    if (isDuplicate) {
      res.status(429).json({
        success: false,
        message: 'A listing with this title and contact number was recently posted. Please allow a few minutes before submitting again.',
      });
      return;
    }

    // 2. Anti-Spam Evaluation
    const spamCheck = detectSpam({
      honeypot: rawPayload._hp,
      title: data.title,
      message: data.description,
      name: data.contactInfo.contactName,
      phone: data.contactInfo.whatsappNumber,
    });

    const files = (req.files as Express.Multer.File[]) || [];

    // Check image constraints
    if (data.listingType === 'WANTED') {
      if (files.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Property wanted advertisements do not accept property images',
        });
        return;
      }
    } else {
      if (files.length > 3) {
        res.status(400).json({
          success: false,
          message: 'A maximum of 3 images can be uploaded per property',
        });
        return;
      }
    }

    // Upload images to Cloudinary if files are present
    if (files.length > 0) {
      if (!isCloudinaryConfigured()) {
        res.status(503).json({
          success: false,
          message:
            'Image upload service is currently unconfigured. Set Cloudinary credentials or post without images.',
        });
        return;
      }

      for (const file of files) {
        const uploadResult = await uploadImageBuffer(file.buffer, file.originalname);
        uploadedCloudinaryImages.push(uploadResult);
      }
    }

    // Generate unique slug & reference ID
    let slug = generatePropertySlug(data.title);
    let existingSlug = await Property.findOne({ slug });
    while (existingSlug) {
      slug = generatePropertySlug(data.title);
      existingSlug = await Property.findOne({ slug });
    }

    let referenceId = generateReferenceId();
    let existingRef = await Property.findOne({ referenceId });
    while (existingRef) {
      referenceId = generateReferenceId();
      existingRef = await Property.findOne({ referenceId });
    }

    // Create property with status PENDING
    // Public users cannot set status, isFeatured, or views
    const property = new Property({
      ...data,
      slug,
      referenceId,
      images: uploadedCloudinaryImages,
      status: 'PENDING',
      views: 0,
      isFeatured: false,
      submitterEmail: rawPayload.submitterEmail || rawPayload.contactEmail || '',
      submitterIp: req.ip || '',
      spamRisk: spamCheck.isSpam ? 'HIGH' : spamCheck.score > 20 ? 'MEDIUM' : 'LOW',
      spamFlags: spamCheck.reasons,
    });

    await property.save();

    // Create in-app admin notification
    try {
      await Notification.create({
        type: 'PROPERTY_SUBMITTED',
        title: 'New Property Submission',
        message: `New ${property.listingType} property submitted: "${property.title}" (${property.referenceId})`,
        propertyId: property._id,
        link: '/admin/properties/pending',
        isRead: false,
      });
    } catch (notifErr) {
      console.warn('[Notification] Failed to create property submission notification:', notifErr);
    }

    // Trigger optional email notification to admin via SMTP
    notifyAdminNewProperty(property).catch((err) =>
      console.warn('[EmailService] Async property email failed:', err)
    );

    res.status(201).json({
      success: true,
      message:
        'Your property advertisement has been submitted successfully and is awaiting approval.',
      data: {
        referenceId: property.referenceId,
        slug: property.slug,
        status: property.status,
        listingType: property.listingType,
        createdAt: property.createdAt,
      },
    });
  } catch (error) {
    // Rollback: If database saving fails, delete any newly uploaded Cloudinary images to avoid orphans
    if (uploadedCloudinaryImages.length > 0) {
      await cleanupUploadedImages(uploadedCloudinaryImages);
    }
    next(error);
  }
};

/**
 * GET /api/properties/areas
 * Returns verified Lahore areas & societies
 */
export const getAreas = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: LAHORE_AREAS_LIST,
  });
};

/**
 * GET /api/properties/categories
 * Returns supported property categories
 */
export const getCategories = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    data: PROPERTY_CATEGORIES_LIST,
  });
};
