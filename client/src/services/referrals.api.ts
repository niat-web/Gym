import { apiClient } from '../lib/axios.js';
import { ApiResponse, ReferralData } from '../types/index.js';

export const referralsApi = {
  getMyReferral: async (): Promise<ApiResponse<ReferralData>> => {
    const res = await apiClient.get<ApiResponse<ReferralData>>('/referrals/me');
    return res.data;
  },

  getAdminSummary: async (): Promise<ApiResponse<{
    totalReferrers: number;
    totalReferralsInvited: number;
    totalConversions: number;
    topReferrers: any[];
  }>> => {
    const res = await apiClient.get<ApiResponse<any>>('/referrals');
    return res.data;
  },
};
