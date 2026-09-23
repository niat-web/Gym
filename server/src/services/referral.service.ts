import { Referral, IReferral } from '../models/Referral.js';
import { User } from '../models/User.js';
import { NotFoundError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export class ReferralService {
  /**
   * Get member's own referral dashboard and referred list
   */
  static async getMyReferral(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let referral = await Referral.findOne({ referrer: userId });
    if (!referral) {
      referral = await Referral.create({
        referrer: user._id,
        referralCode: user.myReferralCode,
        referredMembers: [],
      });
    }

    return {
      referralCode: referral.referralCode,
      rewardPointsPerConversion: referral.referrerRewardValue,
      refereeDiscountPaise: referral.refereeDiscountValue,
      totalReferrals: referral.totalReferrals,
      successfulConversions: referral.successfulConversions,
      loyaltyPoints: user.loyaltyPoints,
      referredMembers: referral.referredMembers.map((m) => ({
        fullName: m.fullName,
        joinedOn: m.joinedOn,
        hasPurchased: m.hasPurchased,
        rewardIssued: m.rewardIssued,
      })),
    };
  }

  /**
   * Process and issue referral rewards on a referee's successful first purchase (Idempotent & Atomic)
   */
  static async processReferralRewardOnFirstPurchase(refereeUserId: string) {
    // Check if referee's reward has already been issued
    const updatedReferral = await Referral.findOneAndUpdate(
      {
        'referredMembers.user': refereeUserId,
        'referredMembers.rewardIssued': false,
      },
      {
        $set: {
          'referredMembers.$.hasPurchased': true,
          'referredMembers.$.rewardIssued': true,
        },
        $inc: {
          successfulConversions: 1,
        },
      },
      { new: true }
    );

    if (updatedReferral) {
      // Award 500 loyalty points to the referrer
      const rewardPoints = updatedReferral.referrerRewardValue || 500;
      await User.findByIdAndUpdate(updatedReferral.referrer, {
        $inc: { loyaltyPoints: rewardPoints },
      });

      logger.info(
        {
          referrerId: updatedReferral.referrer,
          refereeUserId,
          pointsAwarded: rewardPoints,
        },
        'Referral reward issued successfully'
      );

      return { rewarded: true, pointsAwarded: rewardPoints };
    }

    return { rewarded: false };
  }

  /**
   * Admin overview of referrals system
   */
  static async getAdminReferralSummary() {
    const totalReferralDocs = await Referral.countDocuments();
    const stats = await Referral.aggregate([
      {
        $group: {
          _id: null,
          totalReferralsInvited: { $sum: '$totalReferrals' },
          totalConversions: { $sum: '$successfulConversions' },
        },
      },
    ]);

    const topReferrers = await Referral.find({ successfulConversions: { $gt: 0 } })
      .populate('referrer', 'fullName phone email loyaltyPoints')
      .sort({ successfulConversions: -1 })
      .limit(10);

    const aggregateTotals = stats[0] || { totalReferralsInvited: 0, totalConversions: 0 };

    return {
      totalReferrers: totalReferralDocs,
      totalReferralsInvited: aggregateTotals.totalReferralsInvited,
      totalConversions: aggregateTotals.totalConversions,
      topReferrers: topReferrers.map((r) => r.toJSON()),
    };
  }
}
