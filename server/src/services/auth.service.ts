import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User.js';
import { Referral } from '../models/Referral.js';
import { PasswordResetOtp } from '../models/PasswordResetOtp.js';
import { env } from '../config/env.js';
import {
  AuthError,
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../utils/AppError.js';
import { generateReferralCode, generateOtp } from '../utils/generators.js';
import { logger } from '../utils/logger.js';
import { JwtAccessPayload, JwtRefreshPayload } from '../middleware/auth.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (user: IUser): TokenPair => {
  const accessPayload: JwtAccessPayload = {
    sub: user._id.toString(),
    role: user.role,
    ver: user.tokenVersion,
    type: 'access',
  };

  const refreshPayload: JwtRefreshPayload = {
    sub: user._id.toString(),
    ver: user.tokenVersion,
    type: 'refresh',
  };

  const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as any,
  });

  const refreshToken = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL as any,
  });

  return { accessToken, refreshToken };
};

export class AuthService {
  /**
   * Register a new member
   */
  static async register(data: {
    phone: string;
    fullName: string;
    password: string;
    email?: string;
    referralCode?: string;
  }) {
    // 1. Check existing phone
    const existingPhone = await User.findOne({ phone: data.phone });
    if (existingPhone) {
      throw new ConflictError('Phone number is already registered', 'PHONE_ALREADY_EXISTS', 'phone');
    }

    // Check existing email
    if (data.email) {
      const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
      if (existingEmail) {
        throw new ConflictError('Email address is already in use', 'EMAIL_ALREADY_EXISTS', 'email');
      }
    }

    // 2. Validate referral code if provided
    let referrerDoc = null;
    if (data.referralCode) {
      referrerDoc = await Referral.findOne({
        referralCode: data.referralCode.toUpperCase(),
        isActive: true,
      });
      if (!referrerDoc) {
        throw new ValidationError('Invalid or expired referral code', 'referralCode', 'INVALID_REFERRAL_CODE');
      }
    }

    // 3. Generate unique referral code for new user
    let myReferralCode = generateReferralCode(data.fullName);
    let attempts = 0;
    while (await Referral.exists({ referralCode: myReferralCode })) {
      myReferralCode = generateReferralCode(data.fullName);
      attempts++;
      if (attempts > 10) {
        myReferralCode = `FIT${Date.now().toString().slice(-6)}`;
        break;
      }
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 5. Create user
    const newUser = await User.create({
      phone: data.phone,
      passwordHash,
      fullName: data.fullName,
      email: data.email ? data.email.toLowerCase() : undefined,
      role: 'member',
      myReferralCode,
      referredByCode: data.referralCode ? data.referralCode.toUpperCase() : undefined,
      gymMeta: {
        joinedOn: new Date(),
        membershipStatus: 'inactive',
      },
    });

    // 6. Create referral document for this user
    await Referral.create({
      referrer: newUser._id,
      referralCode: myReferralCode,
      referredMembers: [],
    });

    // 7. If referred, track in referrer's document
    if (referrerDoc) {
      await Referral.findByIdAndUpdate(referrerDoc._id, {
        $inc: { totalReferrals: 1 },
        $push: {
          referredMembers: {
            user: newUser._id,
            fullName: newUser.fullName,
            joinedOn: new Date(),
            hasPurchased: false,
            rewardIssued: false,
          },
        },
      });
    }

    // 8. Generate auth tokens
    const tokens = generateTokens(newUser);

    logger.info({ userId: newUser._id, phone: newUser.phone }, 'New user registered');

    return {
      user: newUser.toJSON(),
      tokens,
    };
  }

  /**
   * User login with phone & password
   */
  static async login(phone: string, password: string) {
    const user = await User.findOne({ phone }).select('+passwordHash');
    if (!user) {
      throw new AuthError('Invalid phone number or password', 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been deactivated', 'ACCOUNT_DEACTIVATED');
    }

    if (user.gymMeta?.membershipStatus === 'suspended') {
      throw new ForbiddenError('Your membership account is suspended', 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AuthError('Invalid phone number or password', 'INVALID_CREDENTIALS');
    }

    const tokens = generateTokens(user);

    logger.info({ userId: user._id, role: user.role }, 'User logged in');

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Rotate access & refresh tokens
   */
  static async refreshToken(oldRefreshToken: string) {
    let payload: JwtRefreshPayload;
    try {
      payload = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
    } catch {
      throw new AuthError('Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID');
    }

    if (payload.type !== 'refresh') {
      throw new AuthError('Invalid token type', 'REFRESH_TOKEN_INVALID');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new AuthError('User account is invalid or inactive', 'USER_NOT_FOUND');
    }

    if (user.tokenVersion !== payload.ver) {
      throw new AuthError('Session expired. Please log in again', 'TOKEN_STALE');
    }

    const tokens = generateTokens(user);
    return { tokens, user: user.toJSON() };
  }

  /**
   * Logout user and invalidate all issued tokens
   */
  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    });
    return { success: true };
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new AuthError('Current password does not match', 'INVALID_PASSWORD');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPass, salt);
    user.tokenVersion += 1;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Send Password Reset OTP (Mock SMS in development)
   */
  static async sendPasswordResetOtp(phone: string) {
    const user = await User.findOne({ phone });
    if (!user) {
      // Return success anyway to prevent user enumeration
      return {
        message: 'If the phone number exists, an OTP has been sent.',
        devOtp: env.NODE_ENV === 'development' ? '000000' : undefined,
      };
    }

    const rawOtp = generateOtp();
    const salt = await bcrypt.genSalt(8);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing active OTP for this phone
    await PasswordResetOtp.deleteMany({ phone });

    await PasswordResetOtp.create({
      phone,
      otpHash,
      expiresAt,
      attempts: 0,
      consumed: false,
    });

    logger.info({ phone, rawOtp }, 'Generated Password Reset OTP');

    return {
      message: 'OTP sent successfully to your phone',
      devOtp: env.NODE_ENV === 'development' ? rawOtp : undefined,
    };
  }

  /**
   * Verify Password Reset OTP
   */
  static async verifyPasswordResetOtp(phone: string, otp: string) {
    const record = await PasswordResetOtp.findOne({
      phone,
      consumed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new ValidationError('Invalid or expired OTP', 'otp', 'OTP_EXPIRED');
    }

    if (record.attempts >= 5) {
      await PasswordResetOtp.findByIdAndDelete(record._id);
      throw new ValidationError('Maximum OTP verification attempts exceeded', 'otp', 'OTP_MAX_ATTEMPTS');
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      throw new ValidationError('Incorrect OTP entered', 'otp', 'OTP_INVALID');
    }

    record.consumed = true;
    await record.save();

    const user = await User.findOne({ phone });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Issue short-lived 10-minute reset token
    const resetToken = jwt.sign(
      { sub: user._id.toString(), type: 'password_reset' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '10m' }
    );

    return { resetToken };
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(resetToken: string, newPass: string) {
    let payload: any;
    try {
      payload = jwt.verify(resetToken, env.JWT_ACCESS_SECRET);
    } catch {
      throw new AuthError('Reset token is invalid or expired', 'TOKEN_INVALID');
    }

    if (payload.type !== 'password_reset') {
      throw new AuthError('Invalid reset token type', 'TOKEN_INVALID');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPass, salt);
    user.tokenVersion += 1;
    await user.save();

    return { message: 'Password reset successfully' };
  }
}
