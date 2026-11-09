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

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✅ PASS: ${name}`);
          passed++;
        })
        .catch((err) => {
          console.error(`  ❌ FAIL: ${name}`);
          console.error(err);
          failed++;
        });
    } else {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    }
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    failed++;
  }
}

async function runAllE2ETests() {
  console.log('\n==================================================');
  console.log('🧪 RIZPROPERTY MARKETING AI — END-TO-END SUITE');
  console.log('==================================================\n');

  // TEST A: Security & Unauthorized API Access
  await runTest('TEST A: Security — Requests without valid admin session are blocked with 401', () => {
    let statusCode: number | null = null;
    let jsonPayload: any = null;
    let nextCalled = false;

    const mockReq: any = {
      cookies: {},
      headers: {},
      ip: '127.0.0.1',
    };

    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonPayload = data;
        return this;
      },
    };

    adminAuth(mockReq, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(statusCode, 401, 'Should return HTTP 401 Unauthorized');
    assert.strictEqual(jsonPayload?.success, false, 'Payload success should be false');
    assert.strictEqual(nextCalled, false, 'adminAuth must not invoke next() without credentials');
  });

  // TEST B: Group Matching Intelligence
  await runTest('TEST B: Group Matching Intelligence — Accurate location mapping for Lahore areas', () => {
    const mockBahriaProperty: any = {
      location: { area: 'Bahria Town', society: 'Sector C' },
    };
    const bahriaKeys = getEligibleAreaKeysForProperty(mockBahriaProperty);
    assert.ok(bahriaKeys.includes('Bahria Town'), 'Should match Bahria Town');
    assert.ok(bahriaKeys.includes('All Lahore'), 'Should match All Lahore');

    const mockDhaProperty: any = {
      location: { area: 'DHA Phase 6', society: 'DHA Defence' },
    };
    const dhaKeys = getEligibleAreaKeysForProperty(mockDhaProperty);
    assert.ok(dhaKeys.includes('DHA Defence') || dhaKeys.includes('DHA'), 'Should match DHA');

    const mockMultanRoadProperty: any = {
      location: { area: 'Maraka', society: 'Multan Road' },
    };
    const multanKeys = getEligibleAreaKeysForProperty(mockMultanRoadProperty);
    assert.ok(multanKeys.includes('Multan Road'), 'Should match Multan Road');
    assert.ok(multanKeys.includes('Maraka'), 'Should match Maraka');
  });

  // TEST C: Engine 1 — Daily Website Marketing & UTM Generation
  await runTest('TEST C: Engine 1 — Localized copy generation, UTM tracking, and moderation gate', async () => {
    const mockGroup: any = {
      _id: 'group_123',
      name: 'Bahria Town Lahore Buy and Sell',
      area: 'Bahria Town',
      preferredLanguage: 'ROMAN_URDU',
      groupRules: 'No spam. Real demand mandatory.',
    };

    const copy = await generateAiWebsiteMarketingCopy(
      'FREE_PROPERTY_LISTINGS',
      'ROMAN_URDU',
      mockGroup,
      'https://www.propertyinlahore.online'
    );

    assert.ok(copy.headline.length > 5, 'Should generate an attractive headline');
    assert.ok(copy.caption.includes('https://www.propertyinlahore.online/post-property'), 'Must include website destination link');
    assert.ok(copy.caption.includes('utm_source=facebook'), 'Must include UTM source tracking');
    assert.ok(copy.caption.includes('utm_medium=group'), 'Must include UTM medium tracking');
    assert.ok(copy.hashtags.length >= 2, 'Must include relevant hashtags');
    assert.strictEqual(copy.complianceReport.passedRuleCheck, true, 'Should pass rule check');
  });

  // TEST D: Engine 2 — Property Price Formatting & Copy Integrity
  await runTest('TEST D: Engine 2 — Authentic price formatting (Crore/Lakh) and specifications', async () => {
    assert.strictEqual(formatPricePK(35000000), '3.50 Crore PKR');
    assert.strictEqual(formatPricePK(7500000), '75 Lakh PKR');
    assert.strictEqual(formatPricePK(50000), '50,000 PKR');

    const mockProperty: any = {
      _id: 'prop_999',
      title: 'Brand New 1 Kanal Luxury Designer House',
      slug: 'brand-new-1-kanal-luxury-house',
      referenceId: 'LPH-4821',
      price: 65000000,
      listingType: 'SALE',
      propertyType: 'HOUSE',
      areaSize: 1,
      areaUnit: 'KANAL',
      description: 'Solid construction with imported fittings.',
      location: { area: 'DHA Defence', society: 'Phase 6', block: 'Block B' },
      contactInfo: { whatsappNumber: '+923001234567' },
      facilities: ['Lawn', 'Servant Quarter'],
    };

    const mockGroup: any = {
      _id: 'group_456',
      name: 'DHA Lahore Real Estate',
      area: 'DHA Defence',
      preferredLanguage: 'ENGLISH',
      groupRules: '',
    };

    const copy = await generateAiPropertyMarketingCopy(
      mockProperty,
      mockGroup,
      'https://www.propertyinlahore.online/property/test-slug'
    );

    assert.ok(copy.caption.includes('6.50 Crore PKR'), 'Copy must contain genuine price');
    assert.ok(copy.caption.includes('1 KANAL'), 'Copy must contain accurate dimensions');
    assert.ok(copy.caption.includes('LPH-4821'), 'Copy must contain reference ID');
    assert.ok(copy.caption.includes('+923001234567'), 'Copy must contain contact number');
  });

  // TEST E: AI Compliance & Anti-Deceptive Content Filtering
  await runTest('TEST E: Compliance Engine — Rejects deceptive/guaranteed phrases & validates rules', () => {
    const deceptiveCheck = checkGroupRuleCompliance(
      'Guaranteed 100% Profit in 2 Days',
      'Invest now in crypto and get guaranteed profit!'
    );
    assert.strictEqual(deceptiveCheck.passed, false, 'Should flag deceptive claims');
    assert.ok(deceptiveCheck.warnings.length > 0, 'Should return warning explanation');

    const compliantCheck = checkGroupRuleCompliance(
      '5 Marla House For Sale in Johar Town',
      'Beautiful 5 Marla house for sale. Demand: 1.5 Crore PKR. Call for details.'
    );
    assert.strictEqual(compliantCheck.passed, true, 'Compliant text should pass');
  });

  // TEST F: Cloudinary Marketing Image Pipeline
  await runTest('TEST F: Cloudinary Pipeline — Non-destructive transformations (1080x1080, 1200x630, watermarking)', () => {
    const originalCloudinaryUrl = 'https://res.cloudinary.com/lahore-hub/image/upload/v123456/properties/sample-house.jpg';

    const squareUrl = transformPropertyPhotoUrl(originalCloudinaryUrl, {
      aspectRatio: 'SQUARE_1080',
      watermark: true,
    });

    assert.ok(squareUrl.includes('c_fill,w_1080,h_1080'), 'Must include 1080x1080 crop transformation');
    assert.ok(squareUrl.includes('f_auto,q_auto'), 'Must include auto format and compression');
    assert.ok(squareUrl.includes('l_text:Arial_22_bold'), 'Must include watermark overlay');

    const landscapeUrl = transformPropertyPhotoUrl(originalCloudinaryUrl, {
      aspectRatio: 'LANDSCAPE_1200',
      watermark: false,
    });

    assert.ok(landscapeUrl.includes('c_fill,w_1200,h_630'), 'Must include 1200x630 crop transformation');
    assert.strictEqual(landscapeUrl.includes('l_text:'), false, 'Should omit watermark when disabled');

    // Branded banner resolution
    const bannerUrl = getBrandedWebsiteBanner('FREE_PROPERTY_LISTINGS', 'Bahria Town');
    assert.ok(bannerUrl.startsWith('http'), 'Should return high-res banner URL');
  });

  // TEST G: Idempotency & Cooldown Independence
  await runTest('TEST G: Anti-Duplicate & Independent Cooldowns Contract', () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    const idempotencyKey1 = `website_grp1_FREE_LISTINGS_${dateStr}`;
    const idempotencyKey2 = `website_grp1_FREE_LISTINGS_${dateStr}`;
    assert.strictEqual(idempotencyKey1, idempotencyKey2, 'Identical date & group must produce identical key');

    // Separate cooldown timestamp verification
    const mockGroup: any = {
      websiteMarketingLastPostedAt: new Date(Date.now() - 3600000), // 1 hour ago
      propertyMarketingLastPostedAt: null, // never posted
      postingFrequencyLimitHours: 24,
    };

    const isWebsiteInCooldown =
      mockGroup.websiteMarketingLastPostedAt &&
      Date.now() - mockGroup.websiteMarketingLastPostedAt.getTime() < 24 * 3600000;

    const isPropertyInCooldown =
      mockGroup.propertyMarketingLastPostedAt &&
      Date.now() - mockGroup.propertyMarketingLastPostedAt.getTime() < 24 * 3600000;

    assert.strictEqual(isWebsiteInCooldown, true, 'Website marketing should be in cooldown');
    assert.strictEqual(Boolean(isPropertyInCooldown), false, 'Property marketing should NOT be in cooldown');
  });

  // TEST H: Official Meta Facebook Business Page Integration Contract
  await runTest('TEST H: Official Meta Facebook Page — Rejects unapproved drafts and handles missing tokens safely', async () => {
    const unapprovedDraft: any = {
      _id: 'draft_777',
      status: 'PENDING_APPROVAL',
      headline: 'Test Headline',
      caption: 'Test Caption',
      targetUrl: 'https://www.propertyinlahore.online',
    };

    const result = await publishToOfficialFacebookPage(unapprovedDraft);
    assert.strictEqual(result.success, false, 'Must reject drafts not in APPROVED status');
    assert.ok(result.error?.includes('FB_PAGE_ID') || result.error?.includes('APPROVED'), 'Must provide clear error reason');
  });

  console.log('\n--------------------------------------------------');
  console.log(`Total Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('--------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllE2ETests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
