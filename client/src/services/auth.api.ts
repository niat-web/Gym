import { apiClient } from '../lib/axios.js';
import { ApiResponse, User } from '../types/index.js';

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  register: async (data: {
    phone: string;
    fullName: string;
    password: string;
    email?: string;
    referralCode?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data;
  },

  login: async (data: { phone: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    const res = await apiClient.patch<ApiResponse<null>>('/auth/change-password', data);
    return res.data;
  },

  sendOtp: async (phone: string): Promise<ApiResponse<{ devOtp?: string }>> => {
    const res = await apiClient.post<ApiResponse<{ devOtp?: string }>>('/auth/send-otp', { phone });
    return res.data;
  },

  verifyOtp: async (data: {
    phone: string;
    otp: string;
  }): Promise<ApiResponse<{ resetToken: string }>> => {
    const res = await apiClient.post<ApiResponse<{ resetToken: string }>>('/auth/verify-otp', data);
    return res.data;
  },

  resetPassword: async (data: {
    resetToken: string;
    newPassword: string;
  }): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>('/auth/reset-password', data);
    return res.data;
  },
};
