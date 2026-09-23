import { apiClient } from '../lib/axios.js';
import { ApiResponse, User, PaginatedResponse, UserRole, MembershipStatus } from '../types/index.js';

export const usersApi = {
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>('/users/me');
    return res.data;
  },

  updateMe: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>('/users/me', data);
    return res.data;
  },

  listUsers: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: UserRole;
    status?: MembershipStatus;
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { params });
    return res.data;
  },

  createUser: async (data: {
    phone: string;
    fullName: string;
    password: string;
    email?: string;
    role: 'trainer' | 'member';
    assignedTrainer?: string;
  }): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<User>>('/users', data);
    return res.data;
  },

  listTrainers: async (): Promise<ApiResponse<User[]>> => {
    const res = await apiClient.get<ApiResponse<User[]>>('/users/trainers');
    return res.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },

  updateStatus: async (id: string, status: 'active' | 'suspended'): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, { status });
    return res.data;
  },

  assignTrainer: async (memberId: string, trainerId: string): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<User>>(`/users/${memberId}/assign-trainer`, {
      trainerId,
    });
    return res.data;
  },

  getQrPass: async (userId: string): Promise<ApiResponse<{
    qrData: string;
    memberId: string;
    fullName: string;
    phone: string;
    membershipStatus: string;
    activeSubscription?: any;
  }>> => {
    const res = await apiClient.get<ApiResponse<any>>(`/users/${userId}/qr`);
    return res.data;
  },
};
