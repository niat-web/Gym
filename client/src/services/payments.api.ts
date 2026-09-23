import { apiClient } from '../lib/axios.js';
import { ApiResponse, Payment, PaginatedResponse, PaymentStatus, PaymentMethod } from '../types/index.js';

export interface InitiatePaymentResponse {
  paymentId: string;
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
  isMock: boolean;
  discountBreakdown: {
    originalPaise: number;
    couponDiscountPaise: number;
    referralDiscountPaise: number;
    finalPaise: number;
  };
  plan: {
    id: string;
    name: string;
    calendarDays: number;
    allocatedDays: number;
  };
  prefill: {
    name: string;
    contact: string;
    email: string;
  };
}

export const paymentsApi = {
  initiate: async (data: {
    planId: string;
    couponCode?: string;
    referralCode?: string;
  }): Promise<ApiResponse<InitiatePaymentResponse>> => {
    const res = await apiClient.post<ApiResponse<InitiatePaymentResponse>>('/payments/initiate', data);
    return res.data;
  },

  verify: async (data: {
    paymentId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }): Promise<ApiResponse<{ payment: Payment; subscription?: any; message: string }>> => {
    const res = await apiClient.post<ApiResponse<any>>('/payments/verify', data);
    return res.data;
  },

  recordManualPayment: async (data: {
    memberId: string;
    planId: string;
    amountPaise: number;
    paymentMethod: 'cash' | 'upi';
    upiRef?: string;
    note?: string;
  }): Promise<ApiResponse<{ payment: Payment; subscription: any }>> => {
    const res = await apiClient.post<ApiResponse<any>>('/payments/manual', data);
    return res.data;
  },

  getMyPayments: async (): Promise<ApiResponse<Payment[]>> => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/payments/me');
    return res.data;
  },

  listPayments: async (params?: {
    page?: number;
    pageSize?: number;
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    memberId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Payment>>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>('/payments', { params });
    return res.data;
  },
};
