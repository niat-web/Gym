import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { Plan } from '../models/Plan.js';
import { todayIST, addDays, subDays } from '../utils/date.js';

export class DashboardService {
  /**
   * Owner (Admin) Analytics & KPI Dashboard
   */
  static async getOwnerDashboard() {
    const today = todayIST();
    const now = new Date();
    const in7Days = addDays(now, 7);

    // Start of this month and last month
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // 1. Basic Counts
    const [totalMembers, activeSubscriptions, expiredSubscriptions] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'expired' }),
    ]);

    // 2. Today's Check-ins Count via Aggregation
    const checkInsTodayAgg = await Subscription.aggregate([
      { $unwind: '$attendanceLog' },
      { $match: { 'attendanceLog.date': today } },
      { $count: 'count' },
    ]);
    const checkInsToday = checkInsTodayAgg[0]?.count || 0;

    // 3. Expiring Soon Count
    const expiringIn7Days = await Subscription.countDocuments({
      status: 'active',
      expiresOn: { $gte: now, $lte: in7Days },
    });

    // 4. Revenue This Month vs Last Month
    const revenueAgg = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startOfLastMonth },
        },
      },
      {
        $group: {
          _id: {
            isCurrentMonth: { $gte: ['$createdAt', startOfCurrentMonth] },
          },
          totalPaise: { $sum: '$finalAmountPaise' },
        },
      },
    ]);

    let revenueThisMonthPaise = 0;
    let revenueLastMonthPaise = 0;

    revenueAgg.forEach((r) => {
      if (r._id.isCurrentMonth) {
        revenueThisMonthPaise = r.totalPaise;
      } else {
        revenueLastMonthPaise = r.totalPaise;
      }
    });

    let revenueGrowthPct = 0;
    if (revenueLastMonthPaise > 0) {
      revenueGrowthPct = Math.round(
        ((revenueThisMonthPaise - revenueLastMonthPaise) / revenueLastMonthPaise) * 100
      );
    } else if (revenueThisMonthPaise > 0) {
      revenueGrowthPct = 100;
    }

    // 5. Last 6 Months Revenue Series (Monthly)
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
    const revenueSeriesAgg = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalPaise: { $sum: '$finalAmountPaise' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueSeries = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed for Mongo
      const label = `${monthNames[m - 1]} ${y.toString().slice(-2)}`;

      const found = revenueSeriesAgg.find((r) => r._id.year === y && r._id.month === m);
      revenueSeries.push({
        monthKey: `${y}-${m.toString().padStart(2, '0')}`,
        label,
        revenueRupees: found ? Math.round(found.totalPaise / 100) : 0,
        revenuePaise: found ? found.totalPaise : 0,
        orderCount: found ? found.orderCount : 0,
      });
    }

    // 6. Most Popular Plan
    const popularPlanAgg = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', activeSubs: { $sum: 1 } } },
      { $sort: { activeSubs: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'fitness_plans',
          localField: '_id',
          foreignField: '_id',
          as: 'planDetails',
        },
      },
      { $unwind: '$planDetails' },
    ]);

    const popularPlan = popularPlanAgg[0]
      ? {
          id: popularPlanAgg[0]._id,
          name: popularPlanAgg[0].planDetails.planName,
          category: popularPlanAgg[0].planDetails.category,
          activeCount: popularPlanAgg[0].activeSubs,
        }
      : null;

    // 7. Recent 6 Successful Payments
    const recentPayments = await Payment.find({ status: 'success' })
      .populate('user', 'fullName phone email')
      .populate('plan', 'planName category')
      .sort({ createdAt: -1 })
      .limit(6);

    // 8. Expiring Soon Members preview
    const expiringSoonMembers = await Subscription.find({
      status: 'active',
      expiresOn: { $gte: now, $lte: in7Days },
    })
      .populate('user', 'fullName phone email profile.avatarUrl')
      .populate('plan', 'planName')
      .sort({ expiresOn: 1 })
      .limit(5);

    return {
      kpis: {
        totalMembers,
        activeSubscriptions,
        expiredSubscriptions,
        checkInsToday,
        expiringIn7Days,
        revenueThisMonthPaise,
        revenueLastMonthPaise,
        revenueGrowthPct,
      },
      revenueSeries,
      popularPlan,
      recentPayments: recentPayments.map((p) => p.toJSON()),
      expiringSoonMembers: expiringSoonMembers.map((s) => s.toJSON()),
    };
  }

  /**
   * Trainer Front Desk Dashboard
   */
  static async getTrainerDashboard(trainerId: string) {
    const today = todayIST();
    const now = new Date();
    const in7Days = addDays(now, 7);

    // 1. Today's check-ins
    const subscriptionsToday = await Subscription.find({
      'attendanceLog.date': today,
    })
      .populate('user', 'fullName phone email profile.avatarUrl')
      .populate('attendanceLog.markedBy', 'fullName');

    const todayCheckIns: any[] = [];
    subscriptionsToday.forEach((sub) => {
      const user: any = sub.user;
      if (!user) return;
      const todaysEntries = sub.attendanceLog.filter((e) => e.date === today);
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
        });
      });
    });

    todayCheckIns.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

    // 2. Members expiring soon
    const expiringSoon = await Subscription.find({
      status: 'active',
      expiresOn: { $gte: now, $lte: in7Days },
    })
      .populate('user', 'fullName phone email profile.avatarUrl')
      .populate('plan', 'planName')
      .sort({ expiresOn: 1 })
      .limit(10);

    // 3. Assigned members to this trainer
    const assignedMembers = await User.find({
      role: 'member',
      'gymMeta.assignedTrainer': trainerId,
    })
      .populate('activeSubscription')
      .sort({ fullName: 1 })
      .limit(20);

    return {
      todayCheckInCount: todayCheckIns.length,
      todayCheckIns,
      expiringSoon: expiringSoon.map((s) => s.toJSON()),
      assignedMembers: assignedMembers.map((m) => m.toJSON()),
    };
  }
}
