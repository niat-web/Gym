import mongoose from 'mongoose';
import { Subscription, ISubscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from '../utils/AppError.js';
import { todayIST, formatDisplayDate } from '../utils/date.js';
import { logger } from '../utils/logger.js';

export class CheckInService {
  /**
   * Process an atomic gym check-in for a member
   */
  static async processCheckIn(
    trainerId: string,
    identifier: { memberId?: string; phone?: string }
  ) {
    // 1. Find the member
    let member;
    if (identifier.memberId) {
      member = await User.findById(identifier.memberId);
    } else if (identifier.phone) {
      member = await User.findOne({ phone: identifier.phone });
    }

    if (!member) {
      throw new NotFoundError('Member not found with the provided details', 'MEMBER_NOT_FOUND');
    }

    if (member.gymMeta?.membershipStatus === 'suspended' || !member.isActive) {
      throw new ForbiddenError(
        `${member.fullName}'s membership account is currently suspended`,
        'ACCOUNT_SUSPENDED'
      );
    }

    // 2. Find active subscription
    const subscription = await Subscription.findOne({
      user: member._id,
      status: 'active',
    });

    if (!subscription) {
      throw new ForbiddenError(
        `${member.fullName} does not have an active gym plan. Please purchase or renew a plan.`,
        'NO_ACTIVE_SUBSCRIPTION'
      );
    }

    const today = todayIST();
    const now = new Date();

    // 3. Expiry check
    if (now > new Date(subscription.expiresOn)) {
      subscription.status = 'expired';
      await subscription.save();

      await User.findByIdAndUpdate(member._id, {
        'gymMeta.membershipStatus': 'expired',
      });

      throw new ForbiddenError(
        `Subscription expired on ${formatDisplayDate(subscription.expiresOn)}. Please renew.`,
        'SUBSCRIPTION_EXPIRED'
      );
    }

    // 4. Quota exhausted check
    if (subscription.daysRemaining <= 0) {
      subscription.status = 'exhausted';
      await subscription.save();

      throw new ForbiddenError(
        `All allocated gym visits (${subscription.allocatedDays} visits) have been used up.`,
        'QUOTA_EXHAUSTED'
      );
    }

    const checkInTime = new Date();
    const newEntry = {
      date: today,
      checkInTime,
      markedBy: new mongoose.Types.ObjectId(trainerId),
    };

    // 5. Atomic conditional check-in: deduct ONLY if not checked in today
    const updatedSub = await Subscription.findOneAndUpdate(
      {
        _id: subscription._id,
        status: 'active',
        daysRemaining: { $gt: 0 },
        'attendanceLog.date': { $ne: today },
      },
      {
        $push: { attendanceLog: newEntry },
        $inc: { daysUsed: 1, daysRemaining: -1 },
      },
      { new: true }
    );

    let isFirstToday = true;
    let finalDaysRemaining = subscription.daysRemaining - 1;
    let finalAllocatedDays = subscription.allocatedDays;

    if (updatedSub) {
      // First check-in today! Check if quota just hit 0
      if (updatedSub.daysRemaining === 0) {
        updatedSub.status = 'exhausted';
        await updatedSub.save();
      }
      finalDaysRemaining = updatedSub.daysRemaining;
      finalAllocatedDays = updatedSub.allocatedDays;
    } else {
      // 6. Member ALREADY checked in today: allow re-entry without deducting another visit
      isFirstToday = false;
      finalDaysRemaining = subscription.daysRemaining;
      finalAllocatedDays = subscription.allocatedDays;
    }

    logger.info(
      {
        memberId: member._id,
        memberName: member.fullName,
        trainerId,
        today,
        isFirstToday,
        daysRemaining: finalDaysRemaining,
      },
      'Check-in processed'
    );

    return {
      member: {
        id: member._id.toString(),
        fullName: member.fullName,
        phone: member.phone,
        avatarUrl: member.profile?.avatarUrl,
        membershipStatus: member.gymMeta?.membershipStatus,
      },
      checkInTime,
      today,
      daysRemaining: finalDaysRemaining,
      daysUsed: finalAllocatedDays - finalDaysRemaining,
      allocatedDays: finalAllocatedDays,
      isFirstToday,
      message: isFirstToday
        ? `Attendance marked successfully for ${member.fullName}`
        : `${member.fullName} already checked in earlier today. Entry permitted (no extra visit deducted).`,
    };
  }

  /**
   * Get all check-ins recorded today in IST
   */
  static async getTodayCheckIns() {
    const today = todayIST();

    const subscriptions = await Subscription.find({
      'attendanceLog.date': today,
    })
      .populate('user', 'fullName phone email profile.avatarUrl')
      .populate('attendanceLog.markedBy', 'fullName');

    const todayCheckIns: any[] = [];

    subscriptions.forEach((sub) => {
      const user: any = sub.user;
      if (!user) return;

      const todaysEntries = sub.attendanceLog.filter((entry) => entry.date === today);
      todaysEntries.forEach((entry) => {
        todayCheckIns.push({
          id: `${sub._id}-${entry.checkInTime.getTime()}`,
          memberId: user._id?.toString() || user.id,
          fullName: user.fullName,
          phone: user.phone,
          avatarUrl: user.profile?.avatarUrl,
          planName: sub.planSnapshot?.planName,
          checkInTime: entry.checkInTime,
          markedBy: (entry.markedBy as any)?.fullName || 'Front Desk',
          daysRemaining: sub.daysRemaining,
          allocatedDays: sub.allocatedDays,
        });
      });
    });

    // Sort descending by checkInTime
    todayCheckIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

    return todayCheckIns;
  }

  /**
   * Get attendance history for a member
   */
  static async getMemberAttendanceHistory(memberId: string, limit: number = 30) {
    const subscriptions = await Subscription.find({ user: memberId })
      .populate('attendanceLog.markedBy', 'fullName')
      .sort({ createdAt: -1 });

    const allEntries: any[] = [];

    subscriptions.forEach((sub) => {
      sub.attendanceLog.forEach((entry) => {
        allEntries.push({
          date: entry.date,
          checkInTime: entry.checkInTime,
          checkOutTime: entry.checkOutTime,
          planName: sub.planSnapshot?.planName,
          markedBy: (entry.markedBy as any)?.fullName || 'Trainer',
        });
      });
    });

    allEntries.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

    return allEntries.slice(0, limit);
  }
}
