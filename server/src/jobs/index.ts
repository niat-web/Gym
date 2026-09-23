import cron from 'node-cron';
import { SubscriptionService } from '../services/subscription.service.js';
import { Coupon } from '../models/Coupon.js';
import { Subscription } from '../models/Subscription.js';
import { logger } from '../utils/logger.js';
import { addDays, TIMEZONE, formatDisplayDate } from '../utils/date.js';

let scheduledTasks: cron.ScheduledTask[] = [];

/**
 * Hook for notifications (SMS/WhatsApp)
 */
export const notifyRenewalReminder = async (member: {
  id: string;
  fullName: string;
  phone: string;
  planName: string;
  expiresOn: Date;
}) => {
  logger.info(
    {
      phone: member.phone,
      member: member.fullName,
      plan: member.planName,
      expiryDate: formatDisplayDate(member.expiresOn),
    },
    `[RENEWAL ALERT HOOK] Friendly reminder: Hi ${member.fullName}, your gym membership for ${member.planName} expires on ${formatDisplayDate(member.expiresOn)}. Renew online on FitCore!`
  );
};

/**
 * Job 1: Expire past subscriptions (00:00 Asia/Kolkata)
 */
export const runExpireSubscriptionsJob = async () => {
  logger.info('Running cron job: Expire Past Subscriptions');
  try {
    const result = await SubscriptionService.expirePastSubscriptions();
    logger.info(`Cron completed: Expired ${result.expiredCount} subscriptions`);
    return result;
  } catch (error) {
    logger.error({ error }, 'Error in expirePastSubscriptionsJob');
    throw error;
  }
};

/**
 * Job 2: Deactivate expired coupons (00:05 Asia/Kolkata)
 */
export const runDeactivateExpiredCouponsJob = async () => {
  logger.info('Running cron job: Deactivate Expired Coupons');
  try {
    const now = new Date();
    const result = await Coupon.updateMany(
      {
        isActive: true,
        validUntil: { $lt: now },
      },
      { isActive: false }
    );
    logger.info(`Cron completed: Deactivated ${result.modifiedCount} expired coupons`);
    return { modifiedCount: result.modifiedCount };
  } catch (error) {
    logger.error({ error }, 'Error in deactivateExpiredCouponsJob');
    throw error;
  }
};

/**
 * Job 3: Renewal alerts for subscriptions expiring in 7 days (09:00 Asia/Kolkata)
 */
export const runRenewalAlertsJob = async () => {
  logger.info('Running cron job: Send Renewal Alerts');
  try {
    const now = new Date();
    const in7Days = addDays(now, 7);

    const expiringSoon = await Subscription.find({
      status: 'active',
      expiresOn: { $gte: now, $lte: in7Days },
    }).populate('user', 'fullName phone');

    for (const sub of expiringSoon) {
      const user: any = sub.user;
      if (user && user.phone) {
        await notifyRenewalReminder({
          id: user._id.toString(),
          fullName: user.fullName,
          phone: user.phone,
          planName: sub.planSnapshot?.planName || 'Gym Plan',
          expiresOn: sub.expiresOn,
        });
      }
    }

    logger.info(`Cron completed: Sent renewal alerts to ${expiringSoon.length} members`);
    return { alertCount: expiringSoon.length };
  } catch (error) {
    logger.error({ error }, 'Error in runRenewalAlertsJob');
    throw error;
  }
};

/**
 * Initialize all cron jobs
 */
export const initCronJobs = (): void => {
  // Midnight: 00:00 IST
  const task1 = cron.schedule(
    '0 0 * * *',
    async () => {
      await runExpireSubscriptionsJob();
    },
    { timezone: TIMEZONE }
  );

  // 00:05 IST
  const task2 = cron.schedule(
    '5 0 * * *',
    async () => {
      await runDeactivateExpiredCouponsJob();
    },
    { timezone: TIMEZONE }
  );

  // 09:00 AM IST
  const task3 = cron.schedule(
    '0 9 * * *',
    async () => {
      await runRenewalAlertsJob();
    },
    { timezone: TIMEZONE }
  );

  scheduledTasks = [task1, task2, task3];
  logger.info('FitCore cron jobs registered (Asia/Kolkata timezone)');
};

export const stopCronJobs = (): void => {
  scheduledTasks.forEach((t) => t.stop());
  scheduledTasks = [];
  logger.info('FitCore cron jobs stopped');
};
