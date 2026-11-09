import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getFacebookGroups,
  createFacebookGroup,
  updateFacebookGroup,
  deleteFacebookGroup,
  getMarketingDrafts,
  getMarketingDraftById,
  approveMarketingDraft,
  rejectMarketingDraft,
  skipMarketingDraft,
  triggerWebsiteMarketingRun,
  triggerPropertyMarketingBatch,
  confirmPublished,
  getPostingHistory,
  getMarketingSettings,
  updateMarketingSettings,
} from '../controllers/marketingController.js';

const router = Router();

// Protect ALL marketing routes with existing adminAuth middleware
router.use(adminAuth);

// Facebook Groups
router.get('/groups', getFacebookGroups);
router.post('/groups', createFacebookGroup);
router.put('/groups/:id', updateFacebookGroup);
router.delete('/groups/:id', deleteFacebookGroup);

// Marketing Drafts
router.get('/drafts', getMarketingDrafts);
router.get('/drafts/:id', getMarketingDraftById);
router.post('/drafts/:id/approve', approveMarketingDraft);
router.post('/drafts/:id/reject', rejectMarketingDraft);
router.post('/drafts/:id/skip', skipMarketingDraft);
router.post('/drafts/:id/confirm-published', confirmPublished);

// Campaign Generators
router.post('/campaigns/generate-website', triggerWebsiteMarketingRun);
router.post('/campaigns/process-properties', triggerPropertyMarketingBatch);

// History & Settings
router.get('/history', getPostingHistory);
router.get('/settings', getMarketingSettings);
router.put('/settings', updateMarketingSettings);

export default router;
