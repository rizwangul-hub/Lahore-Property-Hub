import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { config } from '../config/index.js';

// Configure Cloudinary SDK
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  console.log('[Cloudinary] Configured with cloud:', config.cloudinary.cloudName);
} else {
  console.warn(
    '[Cloudinary] ⚠️ Missing Cloudinary credentials in .env. Image uploads will require valid credentials.'
  );
}

export interface UploadedPropertyImage {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret
  );
};

/**
 * Uploads a file buffer to Cloudinary in the designated folder.
 */
export const uploadImageBuffer = async (
  buffer: Buffer,
  filename?: string
): Promise<UploadedPropertyImage> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your backend environment.'
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: config.cloudinary.folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(
            new Error(`Cloudinary upload failed: ${error?.message || 'Unknown upload error'}`)
          );
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes a single image by its publicId from Cloudinary.
 * Ensures only images within the designated folder are deleted.
 */
export const deleteImageByPublicId = async (publicId: string): Promise<boolean> => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  // Prevent deleting assets outside the project folder
  if (!publicId.startsWith(config.cloudinary.folder)) {
    console.warn(`[Cloudinary] Refusing to delete asset outside project folder: ${publicId}`);
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
    return result.result === 'ok';
  } catch (error) {
    console.error(
      `[Cloudinary] Failed to delete image ${publicId}:`,
      error instanceof Error ? error.message : error
    );
    return false;
  }
};

/**
 * Cleanup helper for rollback when property creation fails after images have been uploaded.
 */
export const cleanupUploadedImages = async (
  images: Array<{ publicId: string }>
): Promise<void> => {
  if (!images || images.length === 0) return;

  const deletions = images.map((img) => deleteImageByPublicId(img.publicId));
  await Promise.allSettled(deletions);
};
