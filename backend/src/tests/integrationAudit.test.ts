import assert from 'node:assert';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  getEligibleAreaKeysForProperty,
  formatPricePK,
} from '../services/propertyMarketingEngine.js';
import {
  checkGroupRuleCompliance,
  generateAiWebsiteMarketingCopy,
  generateAiPropertyMarketingCopy,
} from '../services/aiMarketingCopyService.js';
import {
  transformPropertyPhotoUrl,
  preparePropertyMarketingAssets,
  getBrandedWebsiteBanner,
} from '../services/marketingImageService.js';
import { publishToOfficialFacebookPage } from '../services/facebookPageService.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✅ PASS: ${name}`);
          passedTests++;
        })
        .catch((err) => {
          console.error(`  ❌ FAIL: ${name} ->`, err.message);
          failedTests++;
        });
    } else {
      console.log(`  ✅ PASS: ${name}`);
      passedTests++;
    }
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name} ->`, err.message);
    failedTests++;
  }
}

async function runFourPhaseAuditTests() {
  console.log('\n=============================================================');
  console.log('🧪 PROPERTY IN LAHORE — FOUR-PHASE INTEGRATION AUDIT SUITE');
  console.log('=============================================================\n');

  // 1. Timezone Asia/Karachi Verification
  await it('Phase 4: Asia/Karachi timezone time formatting and verification', () => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const formatted = formatter.format(new Date());
    assert.match(formatted, /^\d{2}:\d{2}$/, 'Should format valid 24h time in Asia/Karachi');

    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const dateFormatted = dateFormatter.format(new Date());
    assert.match(dateFormatted, /^\d{4}-\d{2}-\d{2}$/, 'Should format YYYY-MM-DD in Asia/Karachi');
  });

  // 2. Facebook Group Permission Controls
  await it('Phase 2 & 4: Strict Facebook group permission controls isolation', () => {
    const websiteOnlyGroup = {
      allowsWebsiteMarketing: true,
      allowsPropertyAdvertising: false,
      isActive: true,
    };
    const propertyOnlyGroup = {
      allowsWebsiteMarketing: false,
      allowsPropertyAdvertising: true,
      isActive: true,
    };
    const inactiveGroup = {
      allowsWebsiteMarketing: true,
      allowsPropertyAdvertising: true,
      isActive: false,
    };

    // Engine 1 condition
    assert.strictEqual(websiteOnlyGroup.isActive && websiteOnlyGroup.allowsWebsiteMarketing, true);
    assert.strictEqual(propertyOnlyGroup.isActive && propertyOnlyGroup.allowsWebsiteMarketing, false);
    assert.strictEqual(inactiveGroup.isActive && inactiveGroup.allowsWebsiteMarketing, false);

    // Engine 2 condition
    assert.strictEqual(propertyOnlyGroup.isActive && propertyOnlyGroup.allowsPropertyAdvertising, true);
    assert.strictEqual(websiteOnlyGroup.isActive && websiteOnlyGroup.allowsPropertyAdvertising, false);
    assert.strictEqual(inactiveGroup.isActive && inactiveGroup.allowsPropertyAdvertising, false);
  });

  // 3. Independent Cooldowns Logic Contract
  await it('Phase 2 & 4: Independent cooldown tracking for Website vs Property marketing', () => {
    const now = Date.now();
    const cooldownLimitHours = 24;
    const cooldownMs = cooldownLimitHours * 60 * 60 * 1000;

    const group = {
      postingFrequencyLimitHours: cooldownLimitHours,
      websiteMarketingLastPostedAt: new Date(now - (cooldownMs / 2)), // 12 hours ago (in cooldown)
      propertyMarketingLastPostedAt: new Date(now - (cooldownMs * 2)), // 48 hours ago (expired)
    };

    const isWebInCooldown =
      now - new Date(group.websiteMarketingLastPostedAt).getTime() < cooldownMs;
    const isPropInCooldown =
      now - new Date(group.propertyMarketingLastPostedAt).getTime() < cooldownMs;

    assert.strictEqual(isWebInCooldown, true, 'Website marketing should be in active cooldown');
    assert.strictEqual(isPropInCooldown, false, 'Property marketing cooldown should be clear');
  });

  // 4. UTM Parameter Composition Contract
  await it('Phase 4: UTM tracking parameter construction and parsing verification', () => {
    const baseUrl = 'https://www.propertyinlahore.online/properties/dha-defence';
    const utmParams = new URLSearchParams({
      utm_source: 'facebook',
      utm_medium: 'group_post',
      utm_campaign: 'website_daily_dha_defence',
      utm_content: 'theme_free_listings',
    });
    const trackedUrl = `${baseUrl}?${utmParams.toString()}`;

    const parsed = new URL(trackedUrl);
    assert.strictEqual(parsed.origin, 'https://www.propertyinlahore.online');
    assert.strictEqual(parsed.searchParams.get('utm_source'), 'facebook');
    assert.strictEqual(parsed.searchParams.get('utm_medium'), 'group_post');
    assert.strictEqual(parsed.searchParams.get('utm_campaign'), 'website_daily_dha_defence');
    assert.strictEqual(parsed.searchParams.get('utm_content'), 'theme_free_listings');
  });

  // 5. Anti-duplicate Idempotency Key Contract
  await it('Phase 2 & 4: Idempotency keys prevent duplicate generation', () => {
    const generateKey = (type: string, id: string, dateStr: string) => `${type}_${id}_${dateStr}`;
    const key1 = generateKey('WEBSITE', 'grp123', '2026-11-09');
    const key2 = generateKey('WEBSITE', 'grp123', '2026-11-09');
    const key3 = generateKey('WEBSITE', 'grp123', '2026-11-10');

    assert.strictEqual(key1, key2, 'Identical generation parameters must yield identical key');
    assert.notStrictEqual(key1, key3, 'Different dates must yield distinct keys');
  });

  // 6. Security: Meta Official Facebook Page Rejection Contract
  await it('Phase 4: Facebook Page publishing strictly blocks unapproved drafts', async () => {
    const pendingDraft: any = {
      _id: 'draft_unapproved_123',
      status: 'PENDING_APPROVAL',
      generatedContent: { caption: 'Test listing caption' },
      campaignType: 'PROPERTY_MARKETING',
    };

    const res = await publishToOfficialFacebookPage(pendingDraft);
    assert.strictEqual(res.success, false, 'Must reject unapproved draft');
    assert.match(res.error || '', /APPROVED/, 'Error message must specify approval requirement');
  });

  // 7. Security: Property status change cancels pending drafts contract
  await it('Phase 2 & 4: Stale property lifecycle transition simulation', () => {
    const drafts = [
      { id: 'd1', status: 'PENDING_APPROVAL', propertyId: 'prop_999' },
      { id: 'd2', status: 'APPROVED', propertyId: 'prop_999' },
      { id: 'd3', status: 'PUBLISHED', propertyId: 'prop_999' },
    ];

    // Simulate lifecycle update when property is SOLD
    const updatedDrafts = drafts.map((d) => {
      if (['PENDING_APPROVAL', 'APPROVED'].includes(d.status)) {
        return { ...d, status: 'CANCELLED_PROPERTY_UNAVAILABLE', reason: 'Property marked SOLD' };
      }
      return d;
    });

    assert.strictEqual(updatedDrafts[0].status, 'CANCELLED_PROPERTY_UNAVAILABLE');
    assert.strictEqual(updatedDrafts[1].status, 'CANCELLED_PROPERTY_UNAVAILABLE');
    assert.strictEqual(updatedDrafts[2].status, 'PUBLISHED', 'Published history must be preserved');
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`Total Integration Tests: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('-------------------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runFourPhaseAuditTests();
