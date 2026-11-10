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
          headline: `🏡 Property in ${targetArea}: Buy, Sell, Rent & Plots | All-in-One Marketplace!`,
          caption: `🏡 ${targetArea} & All Lahore Real Estate Hub!\n\nWhether you want to SELL, BUY, RENT OUT, or INVEST in property — Property in Lahore connects you directly with genuine owners, verified buyers, and authorized realtors across Lahore!\n\n📋 Everything Under One Roof:\n• Houses & Portions (Buy / Rent: 3, 5, 10 Marla & 1 Kanal)\n• Residential & Commercial Plots (Direct transfer & files)\n• Luxury Apartments & Flats (Furnished & Unfurnished)\n• Commercial Shops, Plazas & Office Spaces\n• 'Property Wanted' Demands (Post your exact requirement!)\n\n✨ Why Property in Lahore?\n✅ 100% Free Property Advertisement Posting\n✅ Direct WhatsApp Contact — No middleman commission delays\n✅ Admin-Moderated & Clean Marketplace\n✅ High visibility across ${targetArea} & prime Lahore societies\n\n👉 Post your property free or search thousands of verified listings:\n${destinationUrl}\n\n#PropertyInLahore #LahoreRealEstate #HouseForSaleLahore #PlotsInLahore #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#PropertyInLahore', '#LahoreRealEstate', '#HouseForSaleLahore', '#PlotsInLahore', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'LANDLORD_RENTAL':
        return {
          headline: `🔑 Looking to Rent or Let in ${targetArea}? Connect Directly!`,
          caption: `🔑 House, Flat ya Portion Kiraye par Dena ya Lena Hai?\n\nAttention Landlords & Tenants in ${targetArea}!\nProperty in Lahore par direct rental advertisements lagayein aur bina kisi broker commission k deal finalize karein.\n\n🏠 Rental Categories Available:\n• Complete Houses (5, 10 Marla, 1 Kanal)\n• Upper & Lower Portions for Families\n• 1, 2, 3 Bed Apartments & Studios\n• Commercial Offices & Retail Shops\n• Hostels & Shared Living Spaces\n\n✨ Key Advantages:\n✅ Direct Owner-to-Tenant WhatsApp Chat\n✅ Zero Agent Commissions\n✅ Verified Family Inquiries & Fast Tenancy\n\n👉 List your rental property or find a home today:\n${destinationUrl}\n\n#RentInLahore #HouseForRent #FlatsForRent #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#RentInLahore', '#HouseForRent', '#FlatsForRent', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'DEALER_PARTNERSHIPS':
        return {
          headline: `💼 Real Estate Agents & Consultants in ${targetArea}: Expand Your Reach!`,
          caption: `💼 Attention Property Dealers & Real Estate Consultants in ${targetArea}!\n\nApni inventory ko Lahore k hazaron active buyers aur investors tak pohanchayein bilkul FREE!\n\n📈 Grow Your Agency Network:\n• Houses, Villas & Modern Bungalows\n• Commercial High-Rise Buildings & Plazas\n• Society Development Plots & Files (DHA, Bahria, Lake City, etc.)\n• Rental Buildings & High-Yield Investment Portfolios\n\n✨ Realtor Benefits:\n✅ Direct client leads sent straight to your agency WhatsApp\n✅ Unlimited free property listings\n✅ Clean, spam-free platform dedicated only to Lahore\n\n👉 Register and showcase your properties today:\n${destinationUrl}\n\n#LahoreDealers #EstateAgency #PropertyDealersLahore #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#LahoreDealers', '#EstateAgency', '#PropertyDealersLahore', `#${targetArea.replace(/\s+/g, '')}`],
        };
      case 'BUYER_DISCOVERY':
        return {
          headline: `🔍 Looking to Buy a Verified House, Plot or Flat in ${targetArea}?`,
          caption: `🔍 Searching for Your Dream Home or Commercial Investment in ${targetArea}?\n\nAvoid fake listings and outdated advertisements! Property in Lahore brings you verified listings with authentic photographs, accurate dimensions, and direct owner contacts.\n\n🎯 Popular Purchase Categories:\n• Brand New & Used Houses (3, 5, 10 Marla, 1 Kanal)\n• Residential Plots with Clear Registry / Transfer Letters\n• Modern Luxury Apartments with Flexible Payment Plans\n• Commercial Shops, Showrooms & Warehouses\n\n💡 Can't find what you need? Post a FREE 'Property Wanted' ad and let sellers contact you!\n\n👉 Explore live verified inventory:\n${destinationUrl}\n\n#BuyPropertyLahore #LahorePlots #PropertyInLahore #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#BuyPropertyLahore', '#LahorePlots', '#PropertyInLahore', `#${targetArea.replace(/\s+/g, '')}`],
        };
      default:
        return {
          headline: `🏢 All-in-One Property Marketplace for ${targetArea}, Lahore`,
          caption: `🏢 Welcome to Property in Lahore — The Complete Real Estate Hub for ${targetArea}!\n\nWhether you need to:\n• BUY a house, flat, or plot\n• SELL your property at market demand\n• RENT a home, upper portion, or commercial shop\n• INVEST in high-return rental commercial spaces\n\n✨ We offer:\n✅ 100% Free Property Ads\n✅ Direct WhatsApp Dealings (No middleman hassle)\n✅ Verified Society & Street Level Coverage\n\n👉 Check listings or post your property advertisement now:\n${destinationUrl}\n\n#PropertyInLahore #LahoreRealEstate #${targetArea.replace(/\s+/g, '')}`,
          hashtags: ['#PropertyInLahore', '#LahoreRealEstate', `#${targetArea.replace(/\s+/g, '')}`],
        };
    }
  }

  // ROMAN URDU (Default high-engagement mobile style)
  switch (theme) {
    case 'FREE_PROPERTY_LISTINGS':
      return {
        headline: `📢 ${targetArea} me Property Sell ya Rent out karni hai? Free Ad Lagayein!`,
        caption: `📢 ${targetArea} aur Poore Lahore k Tamam Property Owners, Landlords aur Customers k liye!\n\n🔹 AGAR AAP K PASS PROPERTY HAI AUR AAP CLIENT DHOOND RAHE HAIN:\nChahe aap k pass Makan, Flat, Room, Upper/Lower Portion, Commercial Office ya Shop hai — abhi Property in Lahore par apna ad bilkul FREE lagayein!\n✨ Hum aapki property ki FREE MARKETING karenge taake aapko foran genuine clients aur tenants mil sakein (Bina kisi broker commission k)!\n\n🔹 AGAR AAP CUSTOMER HAIN AUR APNE LIYE PROPERTY TALAASH KAR RAHE HAIN:\nChahe aapko apne liye Rent par Makan, Flat, Room ya Office chahiye, ya aap apne liye Ghar, Plot ya Commercial Property KHAREEDNA chahte hain — to abhi Property in Lahore par verified listings check karein aur direct owners aur authentic realtors se rabta karein bilkul FREE!\n\n📋 Har Qisam Ki Property Available & Accepted:\n• Flats & Luxury Apartments (Furnished & Unfurnished)\n• Rooms & Hostels (Students & Job holders)\n• Commercial Offices & Retail Shops\n• Houses & Kothiyan (Buy / Rent: 3, 5, 10 Marla & 1 Kanal)\n• Plots & Investment Files\n\n✨ Direct WhatsApp Rabta — Zero Middleman Fees!\n\n👉 Abhi apni property list karein ya verified listings check karein:\n${destinationUrl}\n\n#PropertyInLahore #LahoreRentals #HouseForSaleLahore #FlatForRent #LahorePlots #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#PropertyInLahore', '#LahoreRentals', '#HouseForSaleLahore', '#FlatForRent', '#LahorePlots', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'LANDLORD_RENTAL':
      return {
        headline: `🔑 ${targetArea}: Flat, Room ya Office Kiraye par Dena ya Lena Hai?`,
        caption: `🔑 Attention ${targetArea} Landlords, Tenants & Business Owners!\n\n🔹 AGAR AAP K PASS PROPERTY HAI (Flat, Room, House ya Office):\nAur aap ache tenants ya clients dhoond rahe hain, to abhi Property in Lahore par free ad lagayein. Hum aapki property ki FREE marketing karenge taake shareef family tenants aur verified corporate clients aap tak seedha pohanch sakein!\n\n🔹 AGAR AAP APNE LIYE RENT PAR JAGA DHOOND RAHE HAIN:\nChahe family k liye Flat ya Makan chahiye, bachelor k liye Room, ya business k liye Office/Shop — abhi Property in Lahore par verified rentals check karein aur direct owner se WhatsApp par deal karein bina kisi agent commission k!\n\n✨ Faiday:\n✅ 100% Free Ad Posting\n✅ Direct WhatsApp Dealings (No broker delay)\n✅ Zero Brokerage / Intermediary Fees\n\n👉 Abhi apna rental ad post karein ya verified rentals dekhein:\n${destinationUrl}\n\n#RentInLahore #HouseForRent #FlatForRent #OfficeForRent #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#RentInLahore', '#HouseForRent', '#FlatForRent', '#OfficeForRent', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'DEALER_PARTNERSHIPS':
      return {
        headline: `💼 ${targetArea} k Property Dealers: Free Marketing se Clients Paayein!`,
        caption: `💼 ${targetArea} k Real Estate Consultants & Property Dealers k liye Zabardast Offer!\n\nApni agency ki verified inventory (Houses, Flats, Plots, Offices) Property in Lahore par bilkul FREE post karein!\n✨ Hum aapki inventory ki online marketing karenge taake hazaron active buyers aur genuine tenants seedha aap k WhatsApp par contact karein.\n\n🎯 Sab kuch ek hi jagah:\n• Flats & Apartments Sale / Rent\n• Commercial Offices, Plazas & Shops\n• Residential & Commercial Plots\n• Luxury Houses & Rental Portions\n\n👉 Abhi free register karein aur listings post karein:\n${destinationUrl}\n\n#LahoreDealers #EstateAgency #PropertyDealersLahore #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahoreDealers', '#EstateAgency', '#PropertyDealersLahore', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'BUYER_DISCOVERY':
      return {
        headline: `🔍 ${targetArea}: Apne Liye Ghar, Flat, Plot ya Office Khareedna Hai?`,
        caption: `🔍 ${targetArea} me Apne Liye Dream Property Talash Kar Rahe Hain?\n\nChahe aapko apne rehne k liye Ghar ya Flat chahiye, investment k liye Plot, ya business shuru karne k liye Commercial Office ya Shop — Property in Lahore par certified, genuine listings check karein aur direct owners se WhatsApp par rabta karein!\n\n💡 Agar aap k pass koi property hai jise aap bechna chahte hain:\nAbhi hamari website par ad lagayein, hum aapke ad ki free promotion karenge taake genuine buyer foran mil jaye!\n\n👉 Abhi verified properties check karein ya free ad lagayein:\n${destinationUrl}\n\n#BuyProperty #LahorePlots #PropertyInLahore #FlatsInLahore #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#BuyProperty', '#LahorePlots', '#PropertyInLahore', '#FlatsInLahore', `#${targetArea.replace(/\s+/g, '')}`],
      };
    default:
      return {
        headline: `🏢 ${targetArea} ka Mukammal Real Estate Network — Buy, Sell & Rent!`,
        caption: `🏢 Welcome to Property in Lahore — ${targetArea} Real Estate Hub!\n\n🔹 Agar aap k pass Flat, Room, Office ya Ghar hai aur aap client dhoond rahe hain, to abhi ad lagayein — hum FREE marketing karenge taake aapko buyer ya tenant foran mil sake!\n\n🔹 Agar aap customer hain aur apne liye Flat, Room, Makan ya Office rent ya purchase karna chahte hain, to abhi visit karein aur direct contact karein bina kisi middleman fees k!\n\n✨ 100% Free Ads & Direct WhatsApp Chat\n\n👉 Abhi visit karein:\n${destinationUrl}\n\n#PropertyInLahore #LahoreRealEstate #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#PropertyInLahore', '#LahoreRealEstate', `#${targetArea.replace(/\s+/g, '')}`],
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

    // 4. Create Draft in APPROVED status (Fast 1-click publishing) or PENDING_APPROVAL
    const initialStatus = settings.autoApproveDrafts !== false ? 'APPROVED' : 'PENDING_APPROVAL';

    const draft = await MarketingDraft.create({
      campaignType: 'WEBSITE_MARKETING',
      groupId: group._id,
      groupName: group.name,
      groupUrl: group.groupUrl,
      targetArea: group.area,
      language: group.preferredLanguage || 'ROMAN_URDU',
      theme: currentTheme,
      headline: copy.headline,
      caption: copy.caption,
      hashtags: copy.hashtags,
      imageUrls: [bannerImage],
      targetUrl: `${settings.officialWebsiteUrl}/post-property?utm_source=facebook&utm_medium=group&utm_campaign=${currentTheme.toLowerCase()}`,
      status: initialStatus,
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
