import { Router } from 'express';
import {
  getProperties,
  getPropertyBySlug,
  getSimilarProperties,
  createProperty,
  getAreas,
  getCategories,
} from '../controllers/propertyController.js';
import { propertyUpload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Location and category references
router.get('/areas', getAreas);
router.get('/categories', getCategories);

// Listing retrieval
router.get('/', getProperties);
router.get('/:slug/similar', getSimilarProperties);
router.get('/:slug', getPropertyBySlug);

// Property submission with up to 3 image uploads
router.post('/', propertyUpload.array('images', 3), createProperty);

export default router;
