import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Store files in memory buffer for immediate processing and streaming to Cloudinary
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP images are permitted.`
      )
    );
  }
};

export const propertyUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 3, // Maximum 3 images per property
  },
  fileFilter,
});
