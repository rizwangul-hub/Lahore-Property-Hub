import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
} from '../controllers/adminAuthController.js';
import {
  getDashboardStats,
  getAdminProperties,
  getAdminPropertyById,
  approveProperty,
  rejectProperty,
  changePropertyStatus,
  toggleFeatureProperty,
  updateAdminProperty,
  deleteAdminProperty,
  getAuditLogs,
} from '../controllers/adminPropertyController.js';
import {
  getAdminEnquiries,
  getAdminEnquiryById,
  updateEnquiryStatus,
  updateEnquiryNotes,
  deleteEnquiry,
} from '../controllers/adminEnquiryController.js';
import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { getAdminAnalytics } from '../controllers/analyticsController.js';

const router = Router();

// Dedicated rate limiter for admin login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased to 50 attempts to avoid accidental lockout
  message: {
    success: false,
    message: 'Too many administrative login attempts. Please wait a few minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication Routes
router.post('/auth/login', loginLimiter, adminLogin);
router.post('/auth/logout', adminAuth, adminLogout);
router.get('/auth/me', adminAuth, getAdminProfile);

// Protected Admin Dashboard & Management Routes
router.use(adminAuth);

// Dashboard Overview & Properties
router.get('/dashboard/stats', getDashboardStats);
router.get('/properties', getAdminProperties);
router.get('/properties/:id', getAdminPropertyById);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/reject', rejectProperty);
router.patch('/properties/:id/status', changePropertyStatus);
router.patch('/properties/:id/feature', toggleFeatureProperty);
router.put('/properties/:id', updateAdminProperty);
router.delete('/properties/:id', deleteAdminProperty);
router.get('/audit-logs', getAuditLogs);

// Lead Management & Enquiries
router.get('/enquiries', getAdminEnquiries);
router.get('/enquiries/:id', getAdminEnquiryById);
router.patch('/enquiries/:id/status', updateEnquiryStatus);
router.patch('/enquiries/:id/notes', updateEnquiryNotes);
router.delete('/enquiries/:id', deleteEnquiry);

// In-App Notifications
router.get('/notifications', getAdminNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.post('/notifications/mark-all-read', markAllNotificationsRead);

// Marketplace Analytics
router.get('/analytics', getAdminAnalytics);

export default router;
