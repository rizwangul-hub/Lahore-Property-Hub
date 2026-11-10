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
        headline: `🏡 ${targetArea} me Makan, Plot, Flat Sell ya Rent out karna hai? Free Ad Lagayein!`,
        caption: `🏡 ${targetArea} & All Lahore Real Estate Network!\n\nAgar aap ${targetArea} me koi bhi property SELL, PURCHASE, ya RENT par dena chahte hain, to Property in Lahore par apna ad bilkul FREE lagayein aur genuine buyers aur tenants se direct WhatsApp par rabta karein!\n\n📋 Har Qisam ki Property Available & Accepted:\n• Makan & Kothi (Buy / Rent: 3, 5, 10 Marla & 1 Kanal)\n• Plots & Files (Residential & Commercial)\n• Flats & Luxury Apartments (Furnished & Unfurnished)\n• Upper & Lower Portions (Families k liye)\n• Commercial Shops, Plazas & Offices\n• 'Property Wanted' Demands (Apni matlooba demand post karein)\n\n✨ Property in Lahore k Faiday:\n✅ 100% Free Property Ad Posting\n✅ Direct WhatsApp Contact — Zero agent commission delay\n✅ Authentic & Admin-Moderated Marketplace\n✅ Poore Lahore aur ${targetArea} ki behtareen reach\n\n👉 Abhi 2 minutes me apna free ad lagayein ya verified listings check karein:\n${destinationUrl}\n\n#PropertyInLahore #LahoreRealEstate #MakanBikau #PlotInLahore #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#PropertyInLahore', '#LahoreRealEstate', '#MakanBikau', '#PlotInLahore', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'LANDLORD_RENTAL':
      return {
        headline: `🔑 ${targetArea} me Makan, Flat ya Portion Kiraye par dein bina commission k!`,
        caption: `🔑 Attention Landlords & Tenants in ${targetArea}!\n\nHave a vacant house, flat, or upper portion? Ya kiraye k liye ghar talash kar rahe hain? Property in Lahore par direct ad lagayein aur bina kisi agent k deal karein!\n\n🏠 Rental Categories:\n• Mukammal Ghar & Kothiyan\n• Separate Upper & Lower Portions\n• 1, 2, 3 Bed Apartments\n• Commercial Dukanen & Offices\n\n✨ Faiday:\n✅ Direct Tenant WhatsApp Chat\n✅ Zero Commission Charges\n✅ Vetted Shareef Family Inquiries\n\n👉 Abhi apna rental ad post karein:\n${destinationUrl}\n\n#RentInLahore #HouseForRent #FlatForRent #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#RentInLahore', '#HouseForRent', '#FlatForRent', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'DEALER_PARTNERSHIPS':
      return {
        headline: `💼 ${targetArea} k Estate Agents & Property Dealers k liye Free Portal!`,
        caption: `💼 Attention Real Estate Consultants in ${targetArea}!\n\nApni agency ki verified inventory ko online hazaron buyers aur investors tak pohanchayein bilkul FREE!\n\n📈 Post All Inventory:\n• Houses, Villas & Designer Homes\n• LDA, DHA, Bahria Plots & Files\n• Commercial Shops & Plazas\n• High-Yield Rental Properties\n\n✨ Faiday:\n✅ Direct clients aapke WhatsApp par rabta karenge\n✅ Unlimited free property listings\n✅ Clean, spam-free marketplace\n\n👉 Abhi register karein aur apni agency k ads post karein:\n${destinationUrl}\n\n#LahoreDealers #EstateAgency #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#LahoreDealers', '#EstateAgency', `#${targetArea.replace(/\s+/g, '')}`],
      };
    case 'BUYER_DISCOVERY':
      return {
        headline: `🔍 ${targetArea} me Ghar, Plot ya Flat khareedna chahte hain?`,
        caption: `🔍 ${targetArea} me Verified Property Talash Kar Rahe Hain?\n\nFake ads aur broker k chakar se bachein! Property in Lahore par original photos aur direct owner WhatsApp contact k sath verified properties check karein.\n\n🎯 Buy Categories:\n• Brand New & Resale Houses (3, 5, 10 Marla, 1 Kanal)\n• On-Ground Residential & Commercial Plots\n• Modern Apartments & Studios\n• Commercial Showrooms & Shops\n\n💡 Agar pasand ka ghar na mile, to apna 'Property Wanted' ad free lagayein aur owners khud aapse rabta karenge!\n\n👉 Abhi verified properties check karein:\n${destinationUrl}\n\n#BuyProperty #LahorePlots #PropertyInLahore #${targetArea.replace(/\s+/g, '')}`,
        hashtags: ['#BuyProperty', '#LahorePlots', '#PropertyInLahore', `#${targetArea.replace(/\s+/g, '')}`],
      };
    default:
      return {
        headline: `🏢 ${targetArea} All-in-One Real Estate Hub: Buy, Sell & Rent!`,
        caption: `🏢 Property in Lahore — ${targetArea} ka Mukammal Real Estate Portal!\n\nChahe aapko:\n• Ghar, Flat ya Plot KHAREEDNA ho\n• Apni property behtareen demand par BECHNI ho\n• Makan ya Portion KIRAYE par dena ya lena ho\n• Commercial Investment karni ho\n\n✨ Property in Lahore par:\n✅ 100% Free Property Posting\n✅ Direct WhatsApp Rabta (No middleman)\n✅ Har area aur society ki verified listings\n\n👉 Abhi check karein ya free ad post karein:\n${destinationUrl}\n\n#PropertyInLahore #LahoreRealEstate #${targetArea.replace(/\s+/g, '')}`,
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
