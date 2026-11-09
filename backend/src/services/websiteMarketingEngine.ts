import mongoose from 'mongoose';
import { FacebookGroup, IFacebookGroup } from '../models/FacebookGroup.js';
import { MarketingDraft, IMarketingDraft } from '../models/MarketingDraft.js';
import { MarketingSettings } from '../models/MarketingSettings.js';
import { generateAiWebsiteMarketingCopy } from './aiMarketingCopyService.js';
import { getBrandedWebsiteBanner } from './marketingImageService.js';

export type WebsiteMarketingTheme =
  | 'FREE_PROPERTY_LISTINGS'
  | 'LANDLORD_RENTAL'
  | 'DEALER_PARTNERSHIPS'
  | 'BUYER_DISCOVERY'
  | 'TENANT_DISCOVERY'
  | 'SOCIETY_SPOTLIGHT';

export const WEBSITE_THEMES: WebsiteMarketingTheme[] = [
  'FREE_PROPERTY_LISTINGS',
  'LANDLORD_RENTAL',
  'DEALER_PARTNERSHIPS',
  'BUYER_DISCOVERY',
  'TENANT_DISCOVERY',
  'SOCIETY_SPOTLIGHT',
];

interface GeneratedCopy {
  headline: string;
  caption: string;
  hashtags: string[];
}

/**
 * Builds localized copy for Engine 1 (Daily Website Marketing) based on theme and group language.
 */
export function buildWebsiteMarketingCopy(
  theme: WebsiteMarketingTheme,
  language: 'ENGLISH' | 'URDU' | 'ROMAN_URDU' | 'BILINGUAL',
  group: IFacebookGroup,
  websiteUrl: string
): GeneratedCopy {
  const targetArea = group.area === 'All Lahore' ? 'Lahore' : group.area;
  const utmParam = `?utm_source=facebook&utm_medium=group&utm_campaign=${theme.toLowerCase()}&utm_content=${encodeURIComponent(
    group.name.replace(/\s+/g, '_').toLowerCase()
  )}`;
  const destinationUrl = `${websiteUrl}/post-property${utmParam}`;

  if (language === 'URDU') {
    switch (theme) {
      case 'FREE_PROPERTY_LISTINGS':
        return {
          headline: `🏡 کیا آپ ${targetArea} میں اپنا مکان، پلاٹ یا فلیٹ فروخت کرنا چاہتے ہیں؟`,
          caption: `🏡 کیا آپ ${targetArea} میں اپنا مکان، پلاٹ، فلیٹ یا کمرشل پراپرٹی فروخت کرنا چاہتے ہیں؟\n\nاب بغیر کسی فیس کے لاہور پراپرٹی ہب پر اپنا اشتہار مفت لگائیں اور تصدیق شدہ خریداروں سے براہ راست واٹس ایپ پر رابطہ حاصل کریں۔\n\n✨ اہم فوائد:\n• 100% مفت پراپرٹی اشتہار\n• براہ راست خریداروں سے واٹس ایپ پر رابطہ\n• کوئی پوشیدہ فیس یا کمیشن چکر نہیں\n• ${targetArea} اور تمام بڑے علاقوں میں بھرپور کوریج\n\n👉 ابھی 2 منٹ میں اپنا مفت اشتہار لگائیں:\n${destinationUrl}\n\n#لاہور_پراپرٹی #زمین_جائیداد #لاہور_پراپرٹی_ہب #${targetArea.replace(/\s+/g, '_')}`,
          hashtags: ['#لاہور_پراپرٹی', '#زمین_جائیداد', '#لاہور_پراپرٹی_ہب', `#${targetArea.replace(/\s+/g, '_')}`],
        };
      case 'LANDLORD_RENTAL':
        return {
          headline: `🔑 ${targetArea} کے معزز مکان مالکان کے لیے خوشخبری!`,
          caption: `🔑 ${targetArea} کے معزز مکان مالکان کے لیے خوشخبری!\n\nکیا آپ کا گھر، پورشن یا فلیٹ کرائے کے لیے خالی ہے؟ لاہور پراپرٹی ہب پر اپنا رینٹل اشتہار مفت پوسٹ کریں اور اچھے فیملی کرایہ دار تلاش کریں۔\n\n✨ فوائد:\n• مفت کرایہ داری اشتہار\n• براہ راست فیملی کرایہ داروں کا رابطہ\n• محفوظ اور تصدیق شدہ پورٹل\n\n👉 ابھی اپنا رینٹل یونٹ لسٹ کریں:\n${destinationUrl}\n\n#لاہور_رینٹ #کرایہ_کا_مکان #لاہور_پراپرٹی_ہب #${targetArea.replace(/\s+/g, '_')}`,
          hashtags: ['#لاہور_رینٹ', '#کرایہ_کا_مکان', '#لاہور_پراپرٹی_ہب', `#${targetArea.replace(/\s+/g, '_')}`],
        };
      default:
        return {
          headline: `📢 ${targetArea} کے رہائشیوں اور پراپرٹی ڈیلرز کے لیے اہم اعلان`,
          caption: `📢 ${targetArea} کے رہائشیوں اور پراپرٹی ڈیلرز کے لیے اہم اعلان!\n\nلاہور کا اپنا جدید اور مکمل تصدیق شدہ پراپرٹی پورٹل — لاہور پراپرٹی ہب۔ جہاں آپ خرید، فروخت اور کرائے کے اشتہارات بالکل مفت لگا سکتے ہیں۔\n\n👉 پورٹل وزٹ کریں اور مفت اشتہار لگائیں:\n${destinationUrl}\n\n#لاہور_پراپرٹی #لاہور_پراپرٹی_ہب #${targetArea.replace(/\s+/g, '_')}`,
          hashtags: ['#لاہور_پراپرٹی', '#لاہور_پراپرٹی_ہب', `#${targetArea.replace(/\s+/g, '_')}`],
        };
    }
  }

  if (language === 'ENGLISH') {
    switch (theme) {
      case 'FREE_PROPERTY_LISTINGS':
        return {
          headline: `🏡 Selling or Renting Out Property in ${targetArea}? List It Free!`,
          caption: `🏡 Selling or Renting Out Property in ${targetArea}?\n\nSkip the broker commission and endless phone loops! Publish your house, plot, or commercial space on Lahore Property Hub — Lahore's premier dedicated real estate marketplace.\n\n✨ Why Advertise With Us?\n• 100% Free Property Listings\n• Direct WhatsApp Inquiries Straight to Your Phone\n• Dedicated Coverage Across ${targetArea} & All Prime Sectors\n• Admin-Moderated Marketplace With Genuine Buyers\n\n👉 Post your free listing in 2 minutes:\n${destinationUrl}\n\n#LahoreProperty #PropertyInLahore #RealEstateLahore #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#LahoreProperty', '#PropertyInLahore', '#RealEstateLahore', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'LANDLORD_RENTAL':
        return {
          headline: `🔑 Attention Landlords in ${targetArea}: Find Reliable Tenants Fast`,
          caption: `🔑 Attention Landlords in ${targetArea}: Find Reliable Tenants Fast!\n\nHave a vacant house, upper portion, or luxury apartment? List your rental property on Lahore Property Hub and connect directly with vetted families looking for rental homes in ${targetArea}.\n\n✨ Key Features:\n• Free Rental Advertisement Posting\n• Zero Broker Intermediary Fees\n• Verified WhatsApp Tenant Inquiries\n\n👉 List your rental property now:\n${destinationUrl}\n\n#LahoreRentals #HouseForRentLahore #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#LahoreRentals', '#HouseForRentLahore', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'DEALER_PARTNERSHIPS':
        return {
          headline: `💼 Real Estate Consultants & Dealers Operating in ${targetArea}!`,
          caption: `💼 Real Estate Consultants & Dealers Operating in ${targetArea}!\n\nExpand your agency's online reach. List your verified inventory of houses, plots, and commercial buildings on Lahore Property Hub for free.\n\n✨ Benefits for Real Estate Dealers:\n• Showcase your direct inventory to thousands of monthly visitors\n• Receive direct client inquiries straight to your business WhatsApp\n• Clean, verified marketplace with zero duplicate ad clutter\n\n👉 Register and post free listings today:\n${destinationUrl}\n\n#LahoreRealtors #PropertyDealersLahore #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#LahoreRealtors', '#PropertyDealersLahore', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'BUYER_DISCOVERY':
        return {
          headline: `🔍 Looking to Buy a Verified Property in ${targetArea}?`,
          caption: `🔍 Looking to Buy a Verified Property in ${targetArea}?\n\nDiscover authentic houses, plots, and apartments on Lahore Property Hub. Filter by exact location, price, and specs with direct owner WhatsApp contact.\n\n👉 Browse active listings or submit a Property Wanted request:\n${destinationUrl}\n\n#BuyPropertyLahore #LahoreRealEstate #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#BuyPropertyLahore', '#LahoreRealEstate', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'TENANT_DISCOVERY':
        return {
          headline: `🏢 Searching for a Rental Home or Office in ${targetArea}?`,
          caption: `🏢 Searching for a Rental Home or Office in ${targetArea}?\n\nFind genuine houses, portions, and commercial offices for rent with clear photos and zero hidden brokerage fees on Lahore Property Hub.\n\n👉 Browse rentals or post your rental requirement:\n${destinationUrl}\n\n#RentInLahore #LahoreApartments #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#RentInLahore', '#LahoreApartments', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'SOCIETY_SPOTLIGHT':
      default:
        return {
          headline: `📍 Society Spotlight: ${targetArea} on Lahore Property Hub`,
          caption: `📍 Society Spotlight: ${targetArea} Real Estate!\n\nDiscover premier residential homes, investment plots, and commercial avenues in ${targetArea}. Owners: Advertise your property free. Buyers: Connect directly with owners via WhatsApp.\n\n👉 Visit the marketplace:\n${destinationUrl}\n\n#LahorePropertyHub #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#LahorePropertyHub', `#${targetArea.replace(/\s+/g, '')}`],
        };
    }
  }

  // ROMAN URDU (Default high-engagement mobile style)
  switch (theme) {
    case 'FREE_PROPERTY_LISTINGS':
      return {
        headline: `🏡 ${targetArea} me apna Makan, Plot ya Flat Sell ya Rent out karna hai?`,
        caption: `🏡 ${targetArea} me apna Makan, Plot ya Flat Sell ya Rent out karna hai?\n\nFake calls aur commission k chakar se bachein! Lahore Property Hub par apna property advertisement bilkul FREE lagayein aur genuine buyers aur tenants se direct WhatsApp par rabta karein.\n\n✨ Lahore Property Hub k Faiday:\n• 100% Free Property Posting\n• Direct WhatsApp Inquiries (No middleman fees)\n• ${targetArea} aur poore Lahore ki targeted reach\n• Verified buyers aur authentic marketplace\n\n👉 Abhi 2 minutes me apna free ad lagayein:\n${destinationUrl}\n\n#LahoreProperty #PropertyInLahore #PakistanRealEstate #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahoreProperty', '#PropertyInLahore', '#PakistanRealEstate', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'LANDLORD_RENTAL':
      return {
        headline: `🔑 ${targetArea} k Landlords k liye Best Solution!`,
        caption: `🔑 ${targetArea} k Landlords k liye Best Solution!\n\nAgar aap ka makan, upper portion ya apartment rent par dene k liye ready hai, to Lahore Property Hub par apna free ad post karein aur shareef family tenants se direct WhatsApp par contact karein.\n\n✨ Faiday:\n• Zero broker fees\n• Direct tenant chat\n• Safe & easy posting\n\n👉 Abhi apna rental ad lagayein:\n${destinationUrl}\n\n#LahoreRent #HouseForRent #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahoreRent', '#HouseForRent', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'DEALER_PARTNERSHIPS':
      return {
        headline: `💼 ${targetArea} k Property Dealers aur Estate Consultants k liye!`,
        caption: `💼 ${targetArea} k Property Dealers aur Estate Consultants k liye!\n\nApni agency ki verified inventory ko online hazaron buyers tak pohanchayein. Lahore Property Hub par apni plots aur houses ki listings bilkul FREE post karein aur direct clients WhatsApp par receive karein.\n\n✨ Faiday:\n• Unlimited free listings\n• Direct genuine inquiries\n• Clean & active platform\n\n👉 Abhi register karein aur ads post karein:\n${destinationUrl}\n\n#LahoreDealers #EstateAgency #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahoreDealers', '#EstateAgency', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'BUYER_DISCOVERY':
      return {
        headline: `🔍 ${targetArea} me Ghar ya Plot talash kar rahe hain?`,
        caption: `🔍 ${targetArea} me Ghar ya Plot talash kar rahe hain?\n\nLahore Property Hub par verified properties check karein original photos aur direct owner WhatsApp contact k sath. Ya apni demand 'Property Wanted' section me post karein!\n\n👉 Abhi check karein:\n${destinationUrl}\n\n#BuyProperty #LahorePlots #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#BuyProperty', '#LahorePlots', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'TENANT_DISCOVERY':
      return {
        headline: `🏢 ${targetArea} me Kiraye ka Makan ya Flat chahiye?`,
        caption: `🏢 ${targetArea} me Kiraye ka Makan ya Flat chahiye?\n\nLahore Property Hub par active rental listings browse karein aur direct owner se WhatsApp par deal karein bina kisi agent commission k.\n\n👉 Rental ads check karein:\n${destinationUrl}\n\n#LahoreRentals #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahoreRentals', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'SOCIETY_SPOTLIGHT':
    default:
      return {
        headline: `📍 ${targetArea} Property Hub: Buy, Sell & Rent for Free!`,
        caption: `📍 ${targetArea} Property Hub: Buy, Sell & Rent for Free!\n\n${targetArea} k tamam residential aur commercial properties ek hi jagah. Owners apna free ad lagayein, aur buyers direct WhatsApp par rabta karein.\n\n👉 Abhi visit karein:\n${destinationUrl}\n\n#LahorePropertyHub #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahorePropertyHub', `#${targetArea.replace(/\s+/g, '')}`],
      };
  }
}

/**
 * Engine 1 Execution: Scans active Facebook groups and generates daily website promotional drafts.
 */
export async function generateDailyWebsiteCampaigns(): Promise<{
  generatedCount: number;
  skippedCooldownCount: number;
  drafts: IMarketingDraft[];
}> {
  const settings =
    (await MarketingSettings.findOne()) ||
    (await MarketingSettings.create({
      officialWebsiteUrl: 'https://www.propertyinlahore.online',
    }));

  const activeGroups = await FacebookGroup.find({
    isActive: true,
    allowsWebsiteMarketing: true,
  });

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const drafts: IMarketingDraft[] = [];
  let skippedCooldownCount = 0;

  // Rotate theme daily based on day of year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const currentTheme = WEBSITE_THEMES[dayOfYear % WEBSITE_THEMES.length];

  const bannerUrls =
    settings.defaultBannerUrls && settings.defaultBannerUrls.length > 0
      ? settings.defaultBannerUrls
      : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  for (const group of activeGroups) {
    // 1. Check Cooldown
    if (group.websiteMarketingLastPostedAt) {
      const cooldownMs = group.postingFrequencyLimitHours * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - new Date(group.websiteMarketingLastPostedAt).getTime();
      if (elapsedMs < cooldownMs) {
        skippedCooldownCount++;
        continue;
      }
    }

    // 2. Prevent Duplicate Daily Campaign per group
    const idempotencyKey = `website_${group._id}_${currentTheme}_${dateStr}`;
    const existing = await MarketingDraft.findOne({ idempotencyKey });
    if (existing) {
      continue;
    }

    // 3. Generate Localized Copy (Modular AI Generator with Template Fallback)
    const copy = await generateAiWebsiteMarketingCopy(
      currentTheme,
      group.preferredLanguage || 'ROMAN_URDU',
      group,
      settings.officialWebsiteUrl,
      { aiTone: settings.preferredAiTone }
    );

    const bannerImage = getBrandedWebsiteBanner(currentTheme, group.area);

    // 4. Create Draft in PENDING_APPROVAL status
    const draft = await MarketingDraft.create({
      campaignType: 'WEBSITE_MARKETING',
      groupId: group._id,
      groupName: group.name,
      targetArea: group.area,
      language: group.preferredLanguage || 'ROMAN_URDU',
      theme: currentTheme,
      headline: copy.headline,
      caption: copy.caption,
      hashtags: copy.hashtags,
      imageUrls: [bannerImage],
      targetUrl: `${settings.officialWebsiteUrl}/post-property?utm_source=facebook&utm_medium=group&utm_campaign=${currentTheme.toLowerCase()}`,
      status: 'PENDING_APPROVAL',
      idempotencyKey,
      scheduledDate: now,
    });

    drafts.push(draft);
  }

  return {
    generatedCount: drafts.length,
    skippedCooldownCount,
    drafts,
  };
}
