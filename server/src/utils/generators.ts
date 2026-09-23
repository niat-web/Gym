import crypto from 'crypto';

/**
 * Generate a referral code from full name + random alphanumeric uppercase string
 * Example: "Arjun Sharma" -> "ARJU" + "8K2Q91" = "ARJU8K2Q91"
 */
export const generateReferralCode = (fullName?: string): string => {
  let prefix = 'FIT';
  if (fullName) {
    const clean = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (clean.length >= 3) {
      prefix = clean.slice(0, 4);
    }
  }

  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // non-ambiguous chars
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    randomPart += chars[randomIndex];
  }

  return `${prefix}${randomPart}`;
};

/**
 * Generate a unique receipt number: FIT-<year>-<6 digits>
 * Example: FIT-2026-481920
 */
export const generateReceiptNumber = (): string => {
  const year = new Date().getFullYear();
  const randomSixDigits = crypto.randomInt(100000, 999999);
  return `FIT-${year}-${randomSixDigits}`;
};

/**
 * Generate a 6-digit numeric OTP
 */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};
