import { IFacebookGroup } from '../models/FacebookGroup.js';
import { IProperty } from '../models/Property.js';
import { MarketingDraft } from '../models/MarketingDraft.js';
import { formatPricePK } from './propertyMarketingEngine.js';
import { buildWebsiteMarketingCopy, WebsiteMarketingTheme } from './websiteMarketingEngine.js';

export interface GeneratedMarketingCopy {
  headline: string;
  caption: string;
  hashtags: string[];
  providerUsed: 'GEMINI' | 'OPENAI' | 'TEMPLATE_FALLBACK';
  complianceReport: {
    passedRuleCheck: boolean;
    characterCount: number;
    ruleWarnings: string[];
  };
}

/**
 * Checks content against typical Facebook Group moderation guidelines and custom group rules.
 */
export function checkGroupRuleCompliance(
  headline: string,
  caption: string,
  groupRules?: string
): { passed: boolean; warnings: string[] } {
  const combined = `${headline} ${caption}`.toLowerCase();
  const warnings: string[] = [];

  // 1. Prohibited deceptive real estate claim checks
  const prohibitedPhrases = [
    'guaranteed profit',
    'guaranteed roi',
    '100% profit',
    'crypto',
    'bitcoin',
    'forex',
    'lottery',
    'draw money',
    'be a millionaire',
  ];

  for (const phrase of prohibitedPhrases) {
    if (combined.includes(phrase)) {
      warnings.push(`Contains potentially prohibited deceptive phrase: "${phrase}".`);
    }
  }

  // 2. Custom group rules check
  if (groupRules) {
    const rulesLower = groupRules.toLowerCase();
    if (rulesLower.includes('no price = delete') || rulesLower.includes('price mandatory') || rulesLower.includes('demand lazmi')) {
      if (!combined.includes('pkr') && !combined.includes('crore') && !combined.includes('lakh') && !combined.includes('قیمت')) {
        warnings.push('Group rules mandate clear price/demand, but no price was detected.');
      }
    }

    if (rulesLower.includes('no phone') || rulesLower.includes('no number in post')) {
      if (/(\+92|03\d{2})[- ]?\d{7}/.test(caption)) {
        warnings.push('Group rules may disallow direct phone numbers in caption.');
      }
    }
  }

  return {
    passed: warnings.length === 0,
    warnings,
  };
}

/**
 * Checks for duplicate or near-duplicate captions generated within the last 7 days.
 */
export async function isDuplicateCaption(
  groupId: string,
  caption: string
): Promise<boolean> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentDrafts = await MarketingDraft.find({
    groupId,
    createdAt: { $gte: oneWeekAgo },
  }).select('caption').lean();

  const normalize = (t: string) => t.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '').toLowerCase();
  const targetNorm = normalize(caption);

  for (const draft of recentDrafts) {
    const existingNorm = normalize(draft.caption || '');
    if (existingNorm === targetNorm) {
      return true;
    }
  }

  return false;
}

/**
 * Calls Google Gemini REST API securely using environment variable GEMINI_API_KEY.
 */
async function callGeminiApi(
  prompt: string,
  apiKey: string,
  model = 'gemini-1.5-flash'
): Promise<string | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[AI Engine] Gemini API returned status ${response.status}`);
      return null;
    }

    const json = (await response.json()) as any;
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText ? candidateText.trim() : null;
  } catch (err) {
    console.warn('[AI Engine] Gemini API network error:', err);
    return null;
  }
}

/**
 * Calls OpenAI API securely using OPENAI_API_KEY.
 */
async function callOpenAiApi(
  prompt: string,
  apiKey: string,
  model = 'gpt-4o-mini'
): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.warn(`[AI Engine] OpenAI API returned status ${response.status}`);
      return null;
    }

    const json = (await response.json()) as any;
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('[AI Engine] OpenAI API network error:', err);
    return null;
  }
}

/**
 * Generates AI-powered or template-fallback website marketing copy (Engine 1).
 */
export async function generateAiWebsiteMarketingCopy(
  theme: WebsiteMarketingTheme,
  language: 'ENGLISH' | 'URDU' | 'ROMAN_URDU' | 'BILINGUAL',
  group: IFacebookGroup,
  websiteUrl: string,
  options: { aiProvider?: string; aiTone?: string } = {}
): Promise<GeneratedMarketingCopy> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const targetArea = group.area === 'All Lahore' ? 'Lahore' : group.area;

  // Attempt AI generation if key is present
  if (geminiKey || openaiKey) {
    const prompt = `You are a professional real estate digital marketer for Lahore Property Hub (website: ${websiteUrl}).
Write a high-converting Facebook Group post promoting the website.
Target Audience: Property owners, landlords, buyers, or dealers in ${targetArea}, Lahore.
Theme: ${theme.replace(/_/g, ' ')}.
Language: ${language === 'ROMAN_URDU' ? 'Roman Urdu (Urdu written with English alphabet)' : language === 'URDU' ? 'Urdu script' : 'English'}.
Tone: ${options.aiTone || 'PERSUASIVE and TRUSTWORTHY'}.
Key Website Benefits to emphasize: 100% Free property listing, direct WhatsApp connections, verified Lahore coverage.
Format strictly as JSON with three keys:
"headline": "Short punchy headline under 90 characters",
"caption": "Persuasive body with bullet points and clear call to action (around 150-250 words)",
"hashtags": ["#Tag1", "#Tag2", "#Tag3"]
Do NOT make unrealistic promises like guaranteed immediate sale. Output raw JSON only.`;

    try {
      const rawAiResponse = geminiKey
        ? await callGeminiApi(prompt, geminiKey)
        : await callOpenAiApi(prompt, openaiKey!);

      if (rawAiResponse) {
        const cleaned = rawAiResponse.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.headline && parsed.caption) {
          const utmParam = `?utm_source=facebook&utm_medium=group&utm_campaign=${theme.toLowerCase()}&utm_content=${encodeURIComponent(
            group.name.replace(/\s+/g, '_').toLowerCase()
          )}`;
          const finalUrl = `${websiteUrl}/post-property${utmParam}`;
          const formattedCaption = `${parsed.caption}\n\n👉 List your property or browse verified listings:\n${finalUrl}`;

          const tags = Array.isArray(parsed.hashtags)
            ? parsed.hashtags.map((t: string) => (t.startsWith('#') ? t : `#${t}`))
            : ['#LahoreProperty', '#PropertyInLahore', `#${targetArea.replace(/\s+/g, '')}`];

          const compliance = checkGroupRuleCompliance(parsed.headline, formattedCaption, group.groupRules);

          return {
            headline: parsed.headline.trim(),
            caption: formattedCaption.trim(),
            hashtags: tags,
            providerUsed: geminiKey ? 'GEMINI' : 'OPENAI',
            complianceReport: {
              passedRuleCheck: compliance.passed,
              characterCount: formattedCaption.length,
              ruleWarnings: compliance.warnings,
            },
          };
        }
      }
    } catch (err) {
      console.warn('[AI Engine] Failed parsing AI response, falling back to template engine:', err);
    }
  }

  // Reliable Template Engine Fallback
  const fallback = buildWebsiteMarketingCopy(theme, language, group, websiteUrl);
  const compliance = checkGroupRuleCompliance(fallback.headline, fallback.caption, group.groupRules);

  return {
    headline: fallback.headline,
    caption: fallback.caption,
    hashtags: fallback.hashtags,
    providerUsed: 'TEMPLATE_FALLBACK',
    complianceReport: {
      passedRuleCheck: compliance.passed,
      characterCount: fallback.caption.length,
      ruleWarnings: compliance.warnings,
    },
  };
}

/**
 * Generates AI-powered or template-fallback property advertisement copy (Engine 2).
 */
export async function generateAiPropertyMarketingCopy(
  property: IProperty,
  group: IFacebookGroup,
  destinationUrl: string,
  options: { aiProvider?: string; aiTone?: string } = {}
): Promise<GeneratedMarketingCopy> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const priceFormatted = formatPricePK(property.price);
  const purposeWord = property.listingType === 'RENT' ? 'Rent' : 'Sale';
  const categoryWord = property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1).toLowerCase();
  const locationDetail = [property.location.block, property.location.society || property.location.area, 'Lahore']
    .filter(Boolean)
    .join(', ');
  const areaStr = `${property.areaSize} ${property.areaUnit}`;
  const whatsappNumber = property.contactInfo.whatsappNumber || '+923001234567';

  if (geminiKey || openaiKey) {
    const prompt = `You are a real estate copywriter in Lahore, Pakistan.
Create a Facebook Group property advertisement for an authentic approved listing.
Property Specs:
- Title: ${property.title}
- Type & Purpose: ${areaStr} ${categoryWord} for ${purposeWord}
- Location: ${locationDetail}
- Price / Demand: ${priceFormatted}
- Features: ${property.facilities?.join(', ') || 'Prime location, verified documents'}
- WhatsApp Contact: ${whatsappNumber}
- Reference ID: ${property.referenceId}
- Link: ${destinationUrl}

Target Facebook Group: "${group.name}" (${group.area})
Language: ${group.preferredLanguage === 'ROMAN_URDU' ? 'Roman Urdu (Urdu in English letters)' : group.preferredLanguage === 'URDU' ? 'Urdu script' : 'English'}.
Tone: Professional, urgent, transparent.
Format strictly as JSON with keys:
"headline": "Under 90 chars catchy headline",
"caption": "Accurate detailed listing post with location, price, size, and direct contact",
"hashtags": ["#LahoreProperty", "#Tag2", "#Tag3"]
Do NOT invent fake features or fake prices. Output raw JSON only.`;

    try {
      const rawAiResponse = geminiKey
        ? await callGeminiApi(prompt, geminiKey)
        : await callOpenAiApi(prompt, openaiKey!);

      if (rawAiResponse) {
        const cleaned = rawAiResponse.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.headline && parsed.caption) {
          const tags = Array.isArray(parsed.hashtags)
            ? parsed.hashtags.map((t: string) => (t.startsWith('#') ? t : `#${t}`))
            : ['#LahoreProperty', '#PropertyInLahore', `#${property.location.area.replace(/\s+/g, '')}`];

          const compliance = checkGroupRuleCompliance(parsed.headline, parsed.caption, group.groupRules);

          return {
            headline: parsed.headline.trim(),
            caption: parsed.caption.trim(),
            hashtags: tags,
            providerUsed: geminiKey ? 'GEMINI' : 'OPENAI',
            complianceReport: {
              passedRuleCheck: compliance.passed,
              characterCount: parsed.caption.length,
              ruleWarnings: compliance.warnings,
            },
          };
        }
      }
    } catch (err) {
      console.warn('[AI Engine] Property copy AI parse failed, falling back to template engine:', err);
    }
  }

  // Template fallback
  const headline = group.preferredLanguage === 'ENGLISH'
    ? `🏡 For ${purposeWord}: ${areaStr} ${categoryWord} in ${locationDetail}`
    : `🔥 ${areaStr} ${categoryWord} For ${purposeWord} in ${locationDetail}!`;

  const caption = `🏡 PRIME OPPORTUNITY: ${property.title}\n\n📍 Location: ${locationDetail}\n💰 Demand: ${priceFormatted}\n📐 Size: ${areaStr}\n🏷️ Category: ${categoryWord} (${purposeWord})\n🔖 Ref Code: ${property.referenceId}\n\n📝 Details:\n${property.description.slice(0, 320)}...\n\n💬 Direct WhatsApp Contact (No Middleman):\nWhatsApp: ${whatsappNumber}\n\n🔗 View Verified Listing & Photos:\n${destinationUrl}`;

  const hashtags = ['#LahoreProperty', '#RealEstateLahore', `#${property.location.area.replace(/\s+/g, '')}`];
  const compliance = checkGroupRuleCompliance(headline, caption, group.groupRules);

  return {
    headline,
    caption,
    hashtags,
    providerUsed: 'TEMPLATE_FALLBACK',
    complianceReport: {
      passedRuleCheck: compliance.passed,
      characterCount: caption.length,
      ruleWarnings: compliance.warnings,
    },
  };
}
