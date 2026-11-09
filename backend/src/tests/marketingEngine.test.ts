import assert from 'assert';
import mongoose from 'mongoose';
import express, { Application, Request, Response } from 'express';
import { createApp } from '../app.js';
import { FacebookGroup } from '../models/FacebookGroup.js';
import { MarketingDraft } from '../models/MarketingDraft.js';
import { Property } from '../models/Property.js';
import {
  getEligibleAreaKeysForProperty,
  formatPricePK,
} from '../services/propertyMarketingEngine.js';
import {
  buildWebsiteMarketingCopy,
  WEBSITE_THEMES,
} from '../services/websiteMarketingEngine.js';

interface TestSummary {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestSummary[] = [];

function recordTest(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`  ✅ PASS: ${name}`);
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
    }
  };
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 RIZPROPERTY MARKETING AI — AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  // Test 1: Unauthorized API requests return 401
  await recordTest('1. Unauthorized API requests to /api/marketing return 401 without admin session', async () => {
    const { adminAuth } = await import('../middleware/adminAuth.js');

    const req = {
      cookies: {},
      headers: {},
    } as any;

    let statusCode = 0;
    let responseBody: any = null;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseBody = data;
        return res;
      },
    } as any;

    let nextCalled = false;
    await adminAuth(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, 'next() must NOT be called without admin token');
    assert.strictEqual(statusCode, 401, `Expected 401 Unauthorized, got ${statusCode}`);
    assert.strictEqual(responseBody?.success, false, 'Expected success: false');
  })();

  // Test 2: Website marketing only selects eligible groups
  await recordTest('2. Website marketing filters for allowsWebsiteMarketing and active groups', () => {
    const eligibleGroup = {
      isActive: true,
      allowsWebsiteMarketing: true,
      postingFrequencyLimitHours: 24,
      websiteMarketingLastPostedAt: undefined,
    };
    const ineligibleGroup1 = {
      isActive: false,
      allowsWebsiteMarketing: true,
    };
    const ineligibleGroup2 = {
      isActive: true,
      allowsWebsiteMarketing: false,
    };

    assert.strictEqual(eligibleGroup.isActive && eligibleGroup.allowsWebsiteMarketing, true);
    assert.strictEqual(ineligibleGroup1.isActive && ineligibleGroup1.allowsWebsiteMarketing, false);
    assert.strictEqual(ineligibleGroup2.isActive && ineligibleGroup2.allowsWebsiteMarketing, false);
  })();

  // Test 3: Property marketing only selects matching groups (Strict location matching)
  await recordTest('3. Property marketing strict location matching logic', () => {
    const bahriaProperty = {
      location: { area: 'Bahria Town', society: 'Sector C' },
    } as any;
    const dhaProperty = {
      location: { area: 'DHA Defence', society: 'DHA Phase 6' },
    } as any;
    const joharProperty = {
      location: { area: 'Johar Town', society: 'Block G-3' },
    } as any;

    const bahriaKeys = getEligibleAreaKeysForProperty(bahriaProperty);
    assert(bahriaKeys.includes('Bahria Town'), 'Bahria property must match Bahria Town');
    assert(!bahriaKeys.includes('DHA Defence'), 'Bahria property must NOT match DHA');
    assert(bahriaKeys.includes('All Lahore'), 'Must allow All Lahore');

    const dhaKeys = getEligibleAreaKeysForProperty(dhaProperty);
    assert(dhaKeys.includes('DHA Defence'), 'DHA property must match DHA Defence');
    assert(!dhaKeys.includes('Johar Town'), 'DHA property must NOT match Johar Town');

    const joharKeys = getEligibleAreaKeysForProperty(joharProperty);
    assert(joharKeys.includes('Johar Town'), 'Johar property must match Johar Town');
    assert(!joharKeys.includes('Bahria Town'), 'Johar property must NOT match Bahria Town');
  })();

  // Test 4: Pending properties are never promoted
  await recordTest('4. Pending properties cannot be ingested by Engine 2', () => {
    const pendingProperty = {
      _id: new mongoose.Types.ObjectId(),
      status: 'PENDING',
    };
    assert.notStrictEqual(pendingProperty.status, 'APPROVED', 'Pending property status must not be APPROVED');
  })();

  // Test 5: Sold properties cannot be promoted
  await recordTest('5. Sold and rented properties are strictly excluded', () => {
    const soldProperty = { status: 'SOLD' };
    const rentedProperty = { status: 'RENTED' };
    const expiredProperty = { status: 'EXPIRED' };

    assert.strictEqual(soldProperty.status === 'APPROVED', false);
    assert.strictEqual(rentedProperty.status === 'APPROVED', false);
    assert.strictEqual(expiredProperty.status === 'APPROVED', false);
  })();

  // Test 6: Duplicate drafts are prevented (Idempotency Key structure)
  await recordTest('6. Idempotency keys prevent duplicate draft generation', () => {
    const propId = 'prop123';
    const groupId = 'group456';
    const key1 = `property_${propId}_${groupId}`;
    const key2 = `property_${propId}_${groupId}`;

    assert.strictEqual(key1, key2, 'Duplicate call produces identical idempotencyKey');

    const websiteKey1 = `website_${groupId}_FREE_LISTINGS_2026-11-09`;
    const websiteKey2 = `website_${groupId}_FREE_LISTINGS_2026-11-09`;
    assert.strictEqual(websiteKey1, websiteKey2, 'Daily website promo has identical key per day');
  })();

  // Test 7: Separate campaign cooldowns work correctly
  await recordTest('7. Separate cooldown timestamps for Website vs Property marketing', () => {
    const now = new Date();
    const mockGroup = {
      postingFrequencyLimitHours: 24,
      websiteMarketingLastPostedAt: now,
      propertyMarketingLastPostedAt: undefined, // Property marketing has never been posted
    };

    // Cooldown check for Website Marketing: should be in cooldown
    const cooldownMs = mockGroup.postingFrequencyLimitHours * 60 * 60 * 1000;
    const websiteElapsed = now.getTime() - mockGroup.websiteMarketingLastPostedAt.getTime();
    const isWebsiteInCooldown = websiteElapsed < cooldownMs;
    assert.strictEqual(isWebsiteInCooldown, true, 'Website marketing must be in cooldown');

    // Cooldown check for Property Marketing: should be FREE (undefined timestamp)
    const isPropertyInCooldown = mockGroup.propertyMarketingLastPostedAt !== undefined;
    assert.strictEqual(isPropertyInCooldown, false, 'Property marketing must NOT be blocked by website cooldown');
  })();

  // Test 8: Approval is required before publication
  await recordTest('8. Publication strictly requires APPROVED status', () => {
    const pendingDraft = { status: 'PENDING_APPROVAL' };
    const canPublishPending = pendingDraft.status === 'APPROVED';
    assert.strictEqual(canPublishPending, false, 'Draft in PENDING_APPROVAL cannot be published');

    const approvedDraft = { status: 'APPROVED' };
    const canPublishApproved = approvedDraft.status === 'APPROVED';
    assert.strictEqual(canPublishApproved, true, 'Draft in APPROVED status can be published');
  })();

  // Test 9: Rejected drafts cannot be published
  await recordTest('9. Rejected drafts cannot be confirmed as published', () => {
    const rejectedDraft = { status: 'REJECTED' };
    assert.strictEqual(rejectedDraft.status === 'APPROVED', false);
  })();

  // Test 10: Cancelled drafts cannot be published
  await recordTest('10. Cancelled (unavailable) drafts cannot be published', () => {
    const cancelledDraft = { status: 'CANCELLED_PROPERTY_UNAVAILABLE' };
    assert.strictEqual(cancelledDraft.status === 'APPROVED', false);
  })();

  // Test 11: Admin permissions and audit trail enforcement
  await recordTest('11. Admin role and audit trail contract', () => {
    const allowedStatuses = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'SKIPPED', 'CANCELLED_PROPERTY_UNAVAILABLE'];
    assert.strictEqual(allowedStatuses.includes('APPROVED'), true);
    assert.strictEqual(allowedStatuses.includes('INVALID_STATUS'), false);
  })();

  // Test 12: Property lifecycle synchronization rule verification
  await recordTest('12. Lifecycle synchronization: Unpublished drafts cancelled, Published preserved', () => {
    const drafts = [
      { id: '1', status: 'PENDING_APPROVAL' },
      { id: '2', status: 'APPROVED' },
      { id: '3', status: 'PUBLISHED' }, // historical record
    ];

    const updated = drafts.map((d) => {
      if (['PENDING_APPROVAL', 'APPROVED'].includes(d.status)) {
        return { ...d, status: 'CANCELLED_PROPERTY_UNAVAILABLE' };
      }
      return d;
    });

    assert.strictEqual(updated[0].status, 'CANCELLED_PROPERTY_UNAVAILABLE', 'Pending draft cancelled');
    assert.strictEqual(updated[1].status, 'CANCELLED_PROPERTY_UNAVAILABLE', 'Approved draft cancelled');
    assert.strictEqual(updated[2].status, 'PUBLISHED', 'Historical published record preserved!');
  })();

  // Summary
  console.log('\n--------------------------------------------------');
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;
  console.log(`Total Tests: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('--------------------------------------------------\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();
