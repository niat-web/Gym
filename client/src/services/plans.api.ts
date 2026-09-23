import { apiClient } from '../lib/axios.js';
import { ApiResponse, Plan } from '../types/index.js';

export const plansApi = {
  getActivePlans: async (): Promise<ApiResponse<Plan[]>> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>('/plans');
    return res.data;
  },

  getAllPlans: async (): Promise<ApiResponse<Plan[]>> => {
    const res = await apiClient.get<ApiResponse<Plan[]>>('/plans/all');
    return res.data;
  },

  getPlanById: async (id: string): Promise<ApiResponse<Plan>> => {
    const res = await apiClient.get<ApiResponse<Plan>>(`/plans/${id}`);
    return res.data;
  },

  createPlan: async (data: Partial<Plan>): Promise<ApiResponse<Plan>> => {
    const res = await apiClient.post<ApiResponse<Plan>>('/plans', data);
    return res.data;
  },

  updatePlan: async (id: string, data: Partial<Plan>): Promise<ApiResponse<Plan>> => {
    const res = await apiClient.patch<ApiResponse<Plan>>(`/plans/${id}`, data);
    return res.data;
  },

  activatePlan: async (id: string): Promise<ApiResponse<Plan>> => {
    const res = await apiClient.patch<ApiResponse<Plan>>(`/plans/${id}/activate`);
    return res.data;
  },

  deactivatePlan: async (id: string): Promise<ApiResponse<Plan>> => {
    const res = await apiClient.patch<ApiResponse<Plan>>(`/plans/${id}/deactivate`);
    return res.data;
  },
};
