import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getFacebookGroups,
  getFacebookGroupById,
  createFacebookGroup,
  updateFacebookGroup,
  deleteFacebookGroup,
  getMarketingDrafts,
  getMarketingDraftById,
  updateMarketingDraft,
  regenerateMarketingDraft,
  approveMarketingDraft,
  rejectMarketingDraft,
  skipMarketingDraft,
  triggerWebsiteMarketingRun,
  triggerPropertyMarketingBatch,
  confirmPublished,
  getPostingHistory,
  getMarketingSettings,
  updateMarketingSettings,
  getMarketingStats,
} from '../controllers/marketingController.js';

const router = Router();

// Protect ALL marketing routes with existing adminAuth middleware
router.use(adminAuth);

// Statistics
router.get('/stats', getMarketingStats);

// Facebook Groups
router.get('/groups', getFacebookGroups);
router.get('/groups/:id', getFacebookGroupById);
router.post('/groups', createFacebookGroup);
router.put('/groups/:id', updateFacebookGroup);
router.delete('/groups/:id', deleteFacebookGroup);

// Marketing Drafts
router.get('/drafts', getMarketingDrafts);
router.get('/drafts/:id', getMarketingDraftById);
router.patch('/drafts/:id', updateMarketingDraft);
router.post('/drafts/:id/regenerate', regenerateMarketingDraft);
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
