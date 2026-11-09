import mongoose from 'mongoose';
import { Property, IProperty } from '../models/Property.js';
import { FacebookGroup, IFacebookGroup } from '../models/FacebookGroup.js';
import { MarketingDraft, IMarketingDraft } from '../models/MarketingDraft.js';
import { MarketingSettings } from '../models/MarketingSettings.js';

export function formatPricePK(price: number): string {
  if (price >= 10000000) {
    const crore = price / 10000000;
    return `${crore.toFixed(2).replace(/\.00$/, '')} Crore PKR`;
  }
  if (price >= 100000) {
    const lakh = price / 100000;
    return `${lakh.toFixed(2).replace(/\.00$/, '')} Lakh PKR`;
  }
  return `${price.toLocaleString('en-PK')} PKR`;
}

/**
 * Maps a property's location (area, society) to eligible Facebook group target areas.
 * Strict, validated mapping — no loose fuzzy guessing.
 */
export function getEligibleAreaKeysForProperty(property: IProperty): string[] {
  const combined = `${property.location.area || ''} ${property.location.society || ''}`.toLowerCase();
  const eligibleKeys = new Set<string>();

  // Always eligible for general Lahore groups
  eligibleKeys.add('All Lahore');
  eligibleKeys.add('Lahore');

  if (combined.includes('bahria')) {
    eligibleKeys.add('Bahria Town');
  }
  if (combined.includes('dha') || combined.includes('defence') || combined.includes('prism')) {
    eligibleKeys.add('DHA Defence');
    eligibleKeys.add('DHA');
  }
  if (combined.includes('johar')) {
    eligibleKeys.add('Johar Town');
  }
  if (combined.includes('gulberg')) {
    eligibleKeys.add('Gulberg');
  }
  if (combined.includes('model town')) {
    eligibleKeys.add('Model Town');
  }
  if (combined.includes('wapda')) {
    eligibleKeys.add('Wapda Town');
  }
  if (combined.includes('lake city')) {
    eligibleKeys.add('Lake City');
  }
  if (combined.includes('raiwind')) {
    eligibleKeys.add('Raiwind Road');
  }
  if (combined.includes('valencia')) {
    eligibleKeys.add('Valencia Town');
  }
  if (combined.includes('askari')) {
    eligibleKeys.add('Askari');
  }
  if (combined.includes('maraka')) {
    eligibleKeys.add('Maraka');
  }
  if (combined.includes('cantt')) {
    eligibleKeys.add('Lahore Cantt');
  }

  return Array.from(eligibleKeys);
}

/**
 * Builds localized advertisement copy for Engine 2 (New Approved Property Marketing).
 */
export function buildPropertyMarketingCopy(
  property: IProperty,
  group: IFacebookGroup,
  destinationUrl: string
): { headline: string; caption: string; hashtags: string[] } {
  const priceFormatted = formatPricePK(property.price);
  const purposeWord = property.listingType === 'RENT' ? 'Rent' : 'Sale';
  const purposeUrdu = property.listingType === 'RENT' ? 'برائے کرایہ' : 'برائے فروخت';
  const categoryWord =
    property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1).toLowerCase();
  const locationDetail = [
    property.location.block,
    property.location.society || property.location.area,
    'Lahore',
  ]
    .filter(Boolean)
    .join(', ');

  const areaStr = `${property.areaSize} ${property.areaUnit}`;
  const whatsappNumber = property.contactInfo.whatsappNumber || '+923001234567';
  const refCode = property.referenceId;

  // Urdu Script
  if (group.preferredLanguage === 'URDU') {
    return {
      headline: `✨ ${areaStr} ${categoryWord} ${purposeUrdu} — ${property.location.society || property.location.area}`,
      caption: `✨ شاندار موقع: ${property.title}\n\n📍 لوکیشن: ${locationDetail}\n💰 قیمت: ${priceFormatted}\n📐 رقبہ: ${areaStr}\n🏷️ کیٹیگری: ${categoryWord} (${purposeUrdu})\n🔖 ریفرنس کوڈ: ${refCode}\n\n📝 تفصیلات:\n${property.description.slice(0, 300)}...\n\n📞 براہ راست مالک / ڈیلر سے واٹس ایپ پر رابطہ کریں:\nWhatsApp: ${whatsappNumber}\n\n🔗 مکمل تصاویر اور تفصیلات پورٹل پر دیکھیں:\n${destinationUrl}\n\n#لاہور_پراپرٹی #زمین_جائیداد #${property.location.area.replace(/\s+/g, '_')}`,
      hashtags: ['#لاہور_پراپرٹی', '#زمین_جائیداد', `#${property.location.area.replace(/\s+/g, '_')}`],
    };
  }

  // English
  if (group.preferredLanguage === 'ENGLISH') {
    return {
      headline: `🏡 For ${purposeWord}: ${areaStr} ${categoryWord} in ${locationDetail}`,
      caption: `🏡 PRIME OPPORTUNITY: ${property.title}\n\n📍 Location: ${locationDetail}\n💰 Demand: ${priceFormatted}\n📐 Size: ${areaStr}\n🏷️ Property Type: ${categoryWord} for ${purposeWord}\n🔖 Ref ID: ${refCode}\n\n📝 Specifications:\n${property.description.slice(0, 350)}...\n\n💬 Direct WhatsApp Contact (Zero Middleman):\nWhatsApp: ${whatsappNumber}\n\n🔗 View Full Photos & Specifications on Lahore Property Hub:\n${destinationUrl}\n\n#LahoreProperty #RealEstateLahore #${property.location.area.replace(/\s+/g, '')}`,
      hashtags: ['#LahoreProperty', '#RealEstateLahore', `#${property.location.area.replace(/\s+/g, '')}`],
    };
  }

  // Roman Urdu (Default)
  return {
    headline: `🔥 ${areaStr} ${categoryWord} For ${purposeWord} in ${locationDetail}!`,
    caption: `🔥 Zabardast Offer: ${property.title}\n\n📍 Location: ${locationDetail}\n💰 Demand: ${priceFormatted}\n📐 Size: ${areaStr}\n🏷️ Category: ${categoryWord} (${purposeWord})\n🔖 Ref Code: ${refCode}\n\n📝 Detail:\n${property.description.slice(0, 300)}...\n\n💬 Direct Owner / Dealer WhatsApp Rabta:\nWhatsApp: ${whatsappNumber}\n\n🔗 Mukammal tasweerein aur details check karein:\n${destinationUrl}\n\n#LahoreProperty #PropertyInLahore #${property.location.area.replace(/\s+/g, '')}`,
    hashtags: ['#LahoreProperty', '#PropertyInLahore', `#${property.location.area.replace(/\s+/g, '')}`],
  };
}

/**
 * Engine 2 Execution: Ingests an approved property, matches eligible groups, and creates PENDING_APPROVAL drafts.
 */
export async function processNewApprovedPropertyMarketing(
  propertyId: string | mongoose.Types.ObjectId
): Promise<{
  matchedGroupCount: number;
  draftsCreated: IMarketingDraft[];
}> {
  // 1. Retrieve & verify property is active and APPROVED
  const property = await Property.findById(propertyId);
  if (!property || property.status !== 'APPROVED') {
    return { matchedGroupCount: 0, draftsCreated: [] };
  }

  const settings =
    (await MarketingSettings.findOne()) ||
    (await MarketingSettings.create({
      officialWebsiteUrl: 'https://www.propertyinlahore.online',
    }));

  // 2. Identify eligible target areas
  const eligibleAreas = getEligibleAreaKeysForProperty(property);

  // 3. Find matching active Facebook groups that accept property advertising
  const matchingGroups = await FacebookGroup.find({
    isActive: true,
    allowsPropertyAdvertising: true,
    area: { $in: eligibleAreas },
  });

  const draftsCreated: IMarketingDraft[] = [];
  const now = new Date();

  // Extract authentic Cloudinary image URLs
  const imageUrls =
    property.images && property.images.length > 0
      ? property.images.map((img) => img.secureUrl)
      : [];

  for (const group of matchingGroups) {
    // 4. Check category acceptance
    if (
      group.acceptedCategories &&
      group.acceptedCategories.length > 0 &&
      !group.acceptedCategories.includes('ALL') &&
      !group.acceptedCategories.includes(property.propertyType)
    ) {
      continue;
    }

    // 5. Check group property marketing cooldown
    if (group.propertyMarketingLastPostedAt) {
      const cooldownMs = group.postingFrequencyLimitHours * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - new Date(group.propertyMarketingLastPostedAt).getTime();
      if (elapsedMs < cooldownMs) {
        continue;
      }
    }

    // 6. Enforce strict anti-duplicate rule (propertyId + groupId)
    const idempotencyKey = `property_${property._id}_${group._id}`;
    const existing = await MarketingDraft.findOne({ idempotencyKey });
    if (existing) {
      continue;
    }

    // 7. Destination URL on real website
    const destinationUrl = `${settings.officialWebsiteUrl}/property/${property.slug}?utm_source=facebook&utm_medium=group&utm_campaign=property_ad&utm_content=${group._id}`;

    // 8. Generate Localized Copy
    const copy = buildPropertyMarketingCopy(property, group, destinationUrl);

    // 9. Create draft with PENDING_APPROVAL status
    const draft = await MarketingDraft.create({
      campaignType: 'PROPERTY_MARKETING',
      propertyId: property._id,
      propertySlug: property.slug,
      propertyReferenceId: property.referenceId,
      groupId: group._id,
      groupName: group.name,
      targetArea: group.area,
      language: group.preferredLanguage || 'ROMAN_URDU',
      theme: 'PROPERTY_SPOTLIGHT',
      headline: copy.headline,
      caption: copy.caption,
      hashtags: copy.hashtags,
      imageUrls,
      targetUrl: destinationUrl,
      status: 'PENDING_APPROVAL',
      idempotencyKey,
      scheduledDate: now,
    });

    draftsCreated.push(draft);
  }

  return {
    matchedGroupCount: matchingGroups.length,
    draftsCreated,
  };
}
