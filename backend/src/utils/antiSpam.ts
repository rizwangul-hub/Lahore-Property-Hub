import { Enquiry } from '../models/Enquiry.js';
import { Property } from '../models/Property.js';

/**
 * Normalizes Pakistani and international mobile phone numbers into canonical E.164-style strings.
 * e.g., "0300 1234567" -> "+923001234567"
 * "0321-7654321" -> "+923217654321"
 * "923001234567" -> "+923001234567"
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';

  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

  // Handle leading zeros or 0092
  if (cleaned.startsWith('0092')) {
    cleaned = '+' + cleaned.substring(2);
  } else if (cleaned.startsWith('03') && cleaned.length === 11) {
    cleaned = '+92' + cleaned.substring(1);
  } else if (cleaned.startsWith('92') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+') && cleaned.length === 10) {
    cleaned = '+92' + cleaned;
  }

  return cleaned;
};

/**
 * Validates whether a phone number matches standard Pakistani mobile format (+92 3XX XXXXXXX)
 * or a valid international E.164 number with 10-15 digits.
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Matches Pakistani mobile: +923 followed by 9 digits
  const pakistaniMobileRegex = /^\+923[0-9]{9}$/;
  // General international standard E.164
  const generalE164Regex = /^\+[1-9]\d{7,14}$/;

  return pakistaniMobileRegex.test(normalized) || generalE164Regex.test(normalized);
};

const SUSPICIOUS_KEYWORDS = [
  'casino',
  'viagra',
  'crypto',
  'bitcoin',
  'forex',
  'instant loan',
  'quick cash',
  '<script',
  'javascript:',
  'buy backlinks',
  'seo rank',
  'weight loss',
];

export interface SpamDetectionResult {
  isSpam: boolean;
  score: number;
  reasons: string[];
}

/**
 * Evaluates inbound enquiry or property submission payloads for spam patterns.
 */
export const detectSpam = (payload: {
  honeypot?: string;
  name?: string;
  message?: string;
  title?: string;
  phone?: string;
}): SpamDetectionResult => {
  const reasons: string[] = [];
  let score = 0;

  // 1. Honeypot trap check
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    score += 100;
    reasons.push('Honeypot field triggered');
  }

  // 2. Message / Title keyword check
  const textToCheck = `${payload.name || ''} ${payload.title || ''} ${payload.message || ''}`.toLowerCase();
  for (const kw of SUSPICIOUS_KEYWORDS) {
    if (textToCheck.includes(kw)) {
      score += 35;
      reasons.push(`Contains suspicious keyword: ${kw}`);
    }
  }

  // 3. Excessive URL links in message
  const urlMatches = textToCheck.match(/https?:\/\/[^\s]+/g);
  if (urlMatches && urlMatches.length > 2) {
    score += 40;
    reasons.push('Excessive external hyperlinks in submission');
  }

  // 4. Repeated character spam (e.g. "aaaaaaa", "111111111")
  if (/(.)\1{7,}/.test(textToCheck)) {
    score += 25;
    reasons.push('Repetitive character sequence pattern detected');
  }

  return {
    isSpam: score >= 50,
    score,
    reasons,
  };
};

/**
 * Prevents rapid duplicate enquiry submissions by checking recent records from the same phone for the same property.
 */
export const checkDuplicateEnquiry = async (
  customerPhone: string,
  propertyId: string
): Promise<boolean> => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existing = await Enquiry.findOne({
      customerPhone,
      propertyId,
      createdAt: { $gte: fiveMinutesAgo },
    });
    return !!existing;
  } catch (error) {
    console.warn('[AntiSpam] Duplicate enquiry check error:', error);
    return false;
  }
};

/**
 * Prevents rapid duplicate property listings by checking recent records from the same phone and title.
 */
export const checkDuplicatePropertySubmission = async (
  phone: string,
  title: string
): Promise<boolean> => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const existing = await Property.findOne({
      'contactInfo.whatsappNumber': normalizePhoneNumber(phone),
      title: title.trim(),
      createdAt: { $gte: fifteenMinutesAgo },
    });
    return !!existing;
  } catch (error) {
    console.warn('[AntiSpam] Duplicate property check error:', error);
    return false;
  }
};
