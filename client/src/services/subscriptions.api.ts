import { apiClient } from '../lib/axios.js';
import { ApiResponse, Subscription } from '../types/index.js';

export const subscriptionsApi = {
  getMyActive: async (): Promise<ApiResponse<Subscription | null>> => {
    const res = await apiClient.get<ApiResponse<Subscription | null>>('/subscriptions/me');
    return res.data;
  },

  getMyHistory: async (): Promise<ApiResponse<Subscription[]>> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/me/history');
    return res.data;
  },

  getExpiring: async (days: number = 7): Promise<ApiResponse<Subscription[]>> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>('/subscriptions/expiring', {
      params: { days },
    });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Subscription>> => {
    const res = await apiClient.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return res.data;
  },

  pauseSubscription: async (id: string): Promise<ApiResponse<Subscription>> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`);
    return res.data;
  },

  resumeSubscription: async (id: string): Promise<ApiResponse<Subscription>> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`);
    return res.data;
  },

  cancelSubscription: async (id: string): Promise<ApiResponse<Subscription>> => {
    const res = await apiClient.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`);
    return res.data;
  },
};
