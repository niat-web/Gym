import { apiClient } from '../lib/axios.js';
import { ApiResponse, Coupon } from '../types/index.js';

export interface CouponValidationResponse {
  isValid: boolean;
  discountPaise: number;
  finalPricePaise: number;
  reason?: string;
  coupon?: {
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
  };
}

export const couponsApi = {
  validateCoupon: async (
    code: string,
    planId: string
  ): Promise<ApiResponse<CouponValidationResponse>> => {
    const res = await apiClient.get<ApiResponse<CouponValidationResponse>>(
      `/coupons/validate/${encodeURIComponent(code)}`,
      { params: { planId } }
    );
    return res.data;
  },

  listCoupons: async (): Promise<ApiResponse<Coupon[]>> => {
    const res = await apiClient.get<ApiResponse<Coupon[]>>('/coupons');
    return res.data;
  },

  createCoupon: async (data: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
    const res = await apiClient.post<ApiResponse<Coupon>>('/coupons', data);
    return res.data;
  },

  getCouponById: async (id: string): Promise<ApiResponse<Coupon>> => {
    const res = await apiClient.get<ApiResponse<Coupon>>(`/coupons/${id}`);
    return res.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
    const res = await apiClient.patch<ApiResponse<Coupon>>(`/coupons/${id}`, data);
    return res.data;
  },

  deactivateCoupon: async (id: string): Promise<ApiResponse<Coupon>> => {
    const res = await apiClient.patch<ApiResponse<Coupon>>(`/coupons/${id}/deactivate`);
    return res.data;
  },
};
