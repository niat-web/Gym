import { apiClient } from '../lib/axios.js';
import { ApiResponse } from '../types/index.js';

export interface CheckInResult {
  member: {
    id: string;
    fullName: string;
    phone: string;
    avatarUrl?: string;
    membershipStatus: string;
  };
  checkInTime: string;
  today: string;
  daysRemaining: number;
  daysUsed: number;
  allocatedDays: number;
  isFirstToday: boolean;
  message: string;
}

export interface TodayCheckInItem {
  id: string;
  memberId: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  planName?: string;
  checkInTime: string;
  markedBy: string;
  daysRemaining: number;
  allocatedDays?: number;
}

export const checkinApi = {
  checkIn: async (data: { memberId?: string; phone?: string }): Promise<ApiResponse<CheckInResult>> => {
    const res = await apiClient.post<ApiResponse<CheckInResult>>('/checkin', data);
    return res.data;
  },

  getToday: async (): Promise<ApiResponse<TodayCheckInItem[]>> => {
    const res = await apiClient.get<ApiResponse<TodayCheckInItem[]>>('/checkin/today');
    return res.data;
  },

  getHistory: async (params?: { memberId?: string; limit?: number }): Promise<ApiResponse<any[]>> => {
    const res = await apiClient.get<ApiResponse<any[]>>('/checkin/history', { params });
    return res.data;
  },
};
