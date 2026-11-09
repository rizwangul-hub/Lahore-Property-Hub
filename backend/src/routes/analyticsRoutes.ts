import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { recordAnalyticsEvent } from '../controllers/analyticsController.js';

const router = Router();

// Rate limiter for recording events: allows realistic browsing activity while preventing DoS flooding
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 analytics calls per minute per IP
  message: { success: false, message: 'Too many analytics events' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/event', analyticsLimiter, recordAnalyticsEvent);

export default router;
