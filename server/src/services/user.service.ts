import bcrypt from 'bcryptjs';
import { User, IUser, UserRole, MembershipStatus } from '../models/User.js';
import { Referral } from '../models/Referral.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from '../utils/AppError.js';
import { generateReferralCode } from '../utils/generators.js';

export class UserService {
  /**
   * Get current user profile with active subscription details
   */
  static async getMe(userId: string) {
    const user = await User.findById(userId)
      .populate({
        path: 'activeSubscription',
        populate: { path: 'plan', select: 'planName category pricePaise' },
      })
      .populate('gymMeta.assignedTrainer', 'fullName phone email');

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    return user.toJSON();
  }

  /**
   * Update profile fields with immutability rules
   */
  static async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      email?: string;
      dob?: Date;
      bloodGroup?: string;
      gender?: string;
      avatarUrl?: string;
      address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
      };
    }
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Email immutability rule: Email can be set once. Once set, it cannot be changed.
    if (data.email) {
      const newEmail = data.email.toLowerCase().trim();
      if (user.email && user.email !== newEmail) {
        throw new ValidationError(
          'Email address cannot be modified once set',
          'email',
          'EMAIL_IMMUTABLE'
        );
      }

      // If user had no email, check uniqueness before setting
      if (!user.email) {
        const existingEmailUser = await User.findOne({
          email: newEmail,
          _id: { $ne: user._id },
        });
        if (existingEmailUser) {
          throw new ConflictError(
            'Email address is already in use by another member',
            'EMAIL_ALREADY_EXISTS',
            'email'
          );
        }
        user.email = newEmail;
      }
    }

    if (data.fullName) {
      user.fullName = data.fullName.trim();
    }

    // Whitelist profile attributes
    if (!user.profile) {
      user.profile = {};
    }

    if (data.dob !== undefined) user.profile.dob = data.dob;
    if (data.bloodGroup !== undefined) user.profile.bloodGroup = data.bloodGroup;
    if (data.gender !== undefined) user.profile.gender = data.gender;
    if (data.avatarUrl !== undefined) user.profile.avatarUrl = data.avatarUrl;

    if (data.address) {
      if (!user.profile.address) user.profile.address = {};
      if (data.address.street !== undefined) user.profile.address.street = data.address.street;
      if (data.address.city !== undefined) user.profile.address.city = data.address.city;
      if (data.address.state !== undefined) user.profile.address.state = data.address.state;
      if (data.address.pincode !== undefined) user.profile.address.pincode = data.address.pincode;
    }

    await user.save();
    return user.toJSON();
  }

  /**
   * List users with pagination and filters
   */
  static async listUsers(query: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: UserRole;
    status?: MembershipStatus;
    assignedTrainer?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const filter: any = {};

    if (query.role) {
      filter.role = query.role;
    }

    if (query.status) {
      filter['gymMeta.membershipStatus'] = query.status;
    }

    if (query.assignedTrainer) {
      filter['gymMeta.assignedTrainer'] = query.assignedTrainer;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ fullName: searchRegex }, { phone: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(filter);
    const items = await User.find(filter)
      .populate('activeSubscription')
      .populate('gymMeta.assignedTrainer', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return {
      items: items.map((u) => u.toJSON()),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Admin creates trainer or member
   */
  static async createUser(data: {
    phone: string;
    fullName: string;
    password: string;
    email?: string;
    role: 'trainer' | 'member';
    assignedTrainer?: string;
  }) {
    const existing = await User.findOne({ phone: data.phone });
    if (existing) {
      throw new ConflictError('Phone number already exists', 'PHONE_ALREADY_EXISTS', 'phone');
    }

    if (data.email) {
      const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
      if (existingEmail) {
        throw new ConflictError('Email already exists', 'EMAIL_ALREADY_EXISTS', 'email');
      }
    }

    if (data.assignedTrainer) {
      const trainer = await User.findOne({ _id: data.assignedTrainer, role: 'trainer' });
      if (!trainer) {
        throw new NotFoundError('Assigned trainer not found or is not a trainer');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);
    const myReferralCode = generateReferralCode(data.fullName);

    const newUser = await User.create({
      phone: data.phone,
      passwordHash,
      fullName: data.fullName,
      email: data.email ? data.email.toLowerCase() : undefined,
      role: data.role,
      myReferralCode,
      gymMeta: {
        joinedOn: new Date(),
        membershipStatus: data.role === 'trainer' ? 'active' : 'inactive',
        assignedTrainer: data.assignedTrainer,
      },
    });

    if (data.role === 'member') {
      await Referral.create({
        referrer: newUser._id,
        referralCode: myReferralCode,
        referredMembers: [],
      });
    }

    return newUser.toJSON();
  }

  /**
   * List all active trainers
   */
  static async listTrainers() {
    const trainers = await User.find({ role: 'trainer', isActive: true })
      .select('fullName phone email profile.avatarUrl createdAt')
      .sort({ fullName: 1 });
    return trainers.map((t) => t.toJSON());
  }

  /**
   * Get member details by ID
   */
  static async getUserById(userId: string) {
    const user = await User.findById(userId)
      .populate('activeSubscription')
      .populate('gymMeta.assignedTrainer', 'fullName phone email');

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }
    return user.toJSON();
  }

  /**
   * Admin toggles status (activate / suspend)
   */
  static async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.gymMeta.membershipStatus = status;
    user.isActive = status === 'active';
    await user.save();

    return user.toJSON();
  }

  /**
   * Admin assigns trainer to member
   */
  static async assignTrainer(memberId: string, trainerId: string) {
    const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
    if (!trainer) {
      throw new NotFoundError('Trainer not found', 'TRAINER_NOT_FOUND');
    }

    const member = await User.findById(memberId);
    if (!member) {
      throw new NotFoundError('Member not found', 'MEMBER_NOT_FOUND');
    }

    member.gymMeta.assignedTrainer = trainer._id as any;
    await member.save();

    return member.toJSON();
  }

  /**
   * Get digital QR pass payload for member
   */
  static async getQrPassPayload(userId: string) {
    const user = await User.findById(userId).populate('activeSubscription');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      qrData: JSON.stringify({
        fitcorePass: true,
        memberId: user._id.toString(),
        phone: user.phone,
        name: user.fullName,
        refCode: user.myReferralCode,
      }),
      memberId: user._id.toString(),
      fullName: user.fullName,
      phone: user.phone,
      membershipStatus: user.gymMeta?.membershipStatus || 'inactive',
      activeSubscription: user.activeSubscription,
    };
  }
}
