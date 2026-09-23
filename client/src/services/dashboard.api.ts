import { apiClient } from '../lib/axios.js';
import { ApiResponse, Payment, Subscription, User } from '../types/index.js';

export interface OwnerDashboardData {
  kpis: {
    totalMembers: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    checkInsToday: number;
    expiringIn7Days: number;
    revenueThisMonthPaise: number;
    revenueLastMonthPaise: number;
    revenueGrowthPct: number;
  };
  revenueSeries: Array<{
    monthKey: string;
    label: string;
    revenueRupees: number;
    revenuePaise: number;
    orderCount: number;
  }>;
  popularPlan: {
    id: string;
    name: string;
    category: string;
    activeCount: number;
  } | null;
  recentPayments: Payment[];
  expiringSoonMembers: Subscription[];
}

export interface TrainerDashboardData {
  todayCheckInCount: number;
  todayCheckIns: Array<{
    id: string;
    memberId: string;
    fullName: string;
    phone: string;
    avatarUrl?: string;
    planName?: string;
    checkInTime: string;
    markedBy: string;
    daysRemaining: number;
  }>;
  expiringSoon: Subscription[];
  assignedMembers: User[];
}

export const dashboardApi = {
  getOwnerDashboard: async (): Promise<ApiResponse<OwnerDashboardData>> => {
    const res = await apiClient.get<ApiResponse<OwnerDashboardData>>('/dashboard/owner');
    return res.data;
  },

  getTrainerDashboard: async (): Promise<ApiResponse<TrainerDashboardData>> => {
    const res = await apiClient.get<ApiResponse<TrainerDashboardData>>('/dashboard/trainer');
    return res.data;
  },

  triggerDevJob: async (jobName: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>(`/dev/run-job/${jobName}`);
    return res.data;
  },
};
