import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { submitCustomerEnquiry } from '../controllers/enquiryController.js';

const router = Router();

// Anti-spam rate limiting: max 8 enquiry submissions per 15 minutes per IP
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this connection. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', enquiryLimiter, submitCustomerEnquiry);

export default router;
