import mongoose from 'mongoose';
import { Subscription, ISubscription, SubscriptionStatus } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { Plan, IPlan } from '../models/Plan.js';
import { NotFoundError, ValidationError } from '../utils/AppError.js';
import { addDays, todayIST, isAfter } from '../utils/date.js';
import { logger } from '../utils/logger.js';

export class SubscriptionService {
  /**
   * Create and activate a subscription for a user from a purchased plan
   */
  static async createSubscription(
    userId: string | mongoose.Types.ObjectId,
    plan: IPlan,
    paymentId?: string | mongoose.Types.ObjectId,
    session?: mongoose.ClientSession
  ) {
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // 1. Expire any current active subscriptions for this user
    await Subscription.updateMany(
      { user: userObjectId, status: 'active' },
      { status: 'expired' },
      { session }
    );

    const startsOn = new Date();
    const expiresOn = addDays(startsOn, plan.calendarDays);

    const subscriptionData = {
      user: userObjectId,
      plan: plan._id,
      payment: paymentId,
      planSnapshot: {
        planName: plan.planName,
        pricePaise: plan.pricePaise,
        allocatedDays: plan.allocatedDays,
        calendarDays: plan.calendarDays,
        features: plan.features || [],
      },
      status: 'active' as SubscriptionStatus,
      allocatedDays: plan.allocatedDays,
      daysUsed: 0,
      daysRemaining: plan.allocatedDays,
      startsOn,
      expiresOn,
      attendanceLog: [],
    };

    const createdSubscriptions = await Subscription.create([subscriptionData], { session });
    const newSubscription = createdSubscriptions[0];

    // Update user active subscription and status
    await User.findByIdAndUpdate(
      userObjectId,
      {
        activeSubscription: newSubscription._id,
        'gymMeta.membershipStatus': 'active',
      },
      { session }
    );

    logger.info(
      { userId: userObjectId, subscriptionId: newSubscription._id, planName: plan.planName },
      'Subscription created and activated'
    );

    return newSubscription;
  }

  /**
   * Get active subscription for current member, auto-expiring if past expiresOn
   */
  static async getMyActiveSubscription(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
    }).populate('plan', 'planName category pricePaise features');

    if (!subscription) {
      return null;
    }

    // Check if subscription has expired
    const now = new Date();
    if (now > new Date(subscription.expiresOn)) {
      subscription.status = 'expired';
      await subscription.save();

      await User.findByIdAndUpdate(userId, {
        'gymMeta.membershipStatus': 'expired',
      });
      return null;
    }

    return subscription.toJSON();
  }

  /**
   * Get member subscription history
   */
  static async getMySubscriptionHistory(userId: string) {
    const subscriptions = await Subscription.find({ user: userId })
      .populate('plan', 'planName category pricePaise')
      .populate('payment', 'receiptNumber finalAmountPaise paymentMethod createdAt')
      .sort({ createdAt: -1 });

    return subscriptions.map((s) => s.toJSON());
  }

  /**
   * Get subscriptions expiring in the next N days (Admin/Trainer)
   */
  static async getExpiringSubscriptions(days: number = 7) {
    const now = new Date();
    const futureDate = addDays(now, days);

    const subscriptions = await Subscription.find({
      status: 'active',
      expiresOn: {
        $gte: now,
        $lte: futureDate,
      },
    })
      .populate('user', 'fullName phone email profile.avatarUrl')
      .populate('plan', 'planName category')
      .sort({ expiresOn: 1 });

    return subscriptions.map((s) => s.toJSON());
  }

  /**
   * Get subscription by ID
   */
  static async getSubscriptionById(subscriptionId: string) {
    const subscription = await Subscription.findById(subscriptionId)
      .populate('user', 'fullName phone email profile')
      .populate('plan')
      .populate('payment')
      .populate('attendanceLog.markedBy', 'fullName');

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }
    return subscription.toJSON();
  }

  /**
   * Admin pause subscription
   */
  static async pauseSubscription(subscriptionId: string) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new ValidationError(`Cannot pause subscription with status '${subscription.status}'`);
    }

    subscription.status = 'paused';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.user, {
      'gymMeta.membershipStatus': 'inactive',
    });

    return subscription.toJSON();
  }

  /**
   * Admin resume subscription
   */
  static async resumeSubscription(subscriptionId: string) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.status !== 'paused') {
      throw new ValidationError(`Cannot resume subscription with status '${subscription.status}'`);
    }

    subscription.status = 'active';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.user, {
      'gymMeta.membershipStatus': 'active',
    });

    return subscription.toJSON();
  }

  /**
   * Admin cancel subscription
   */
  static async cancelSubscription(subscriptionId: string) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    subscription.status = 'cancelled';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.user, {
      activeSubscription: null,
      'gymMeta.membershipStatus': 'inactive',
    });

    return subscription.toJSON();
  }

  /**
   * Cron Job: Expire active subscriptions whose expiresOn is in the past
   */
  static async expirePastSubscriptions() {
    const now = new Date();
    const expiredSubs = await Subscription.find({
      status: 'active',
      expiresOn: { $lt: now },
    });

    if (expiredSubs.length === 0) {
      return { expiredCount: 0 };
    }

    const subIds = expiredSubs.map((s) => s._id);
    const userIds = expiredSubs.map((s) => s.user);

    await Subscription.updateMany(
      { _id: { $in: subIds } },
      { status: 'expired' }
    );

    await User.updateMany(
      { _id: { $in: userIds }, activeSubscription: { $in: subIds } },
      { 'gymMeta.membershipStatus': 'expired' }
    );

    logger.info(`Cron: Expired ${expiredSubs.length} past subscriptions`);
    return { expiredCount: expiredSubs.length };
  }
}
