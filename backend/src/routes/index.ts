import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import adminRoutes from './adminRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

// Mount API route modules
router.use('/health', healthRoutes);
router.use('/properties', propertyRoutes);
router.use('/admin', adminRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
