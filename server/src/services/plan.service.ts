import { Plan, IPlan } from '../models/Plan.js';
import { NotFoundError } from '../utils/AppError.js';

export class PlanService {
  /**
   * List all active fitness plans (for members and store)
   */
  static async getActivePlans() {
    const plans = await Plan.find({ isActive: true }).sort({ pricePaise: 1 });
    return plans.map((p) => p.toJSON());
  }

  /**
   * List all plans including inactive (for Admin)
   */
  static async getAllPlans() {
    const plans = await Plan.find().sort({ createdAt: -1 });
    return plans.map((p) => p.toJSON());
  }

  /**
   * Get plan details by ID
   */
  static async getPlanById(planId: string) {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new NotFoundError('Plan not found', 'PLAN_NOT_FOUND');
    }
    return plan.toJSON();
  }

  /**
   * Create a new plan (Admin)
   */
  static async createPlan(data: Partial<IPlan>) {
    const plan = await Plan.create(data);
    return plan.toJSON();
  }

  /**
   * Update existing plan (Admin)
   */
  static async updatePlan(planId: string, data: Partial<IPlan>) {
    const plan = await Plan.findByIdAndUpdate(planId, data, { new: true });
    if (!plan) {
      throw new NotFoundError('Plan not found', 'PLAN_NOT_FOUND');
    }
    return plan.toJSON();
  }

  /**
   * Toggle active state of plan
   */
  static async setPlanStatus(planId: string, isActive: boolean) {
    const plan = await Plan.findByIdAndUpdate(planId, { isActive }, { new: true });
    if (!plan) {
      throw new NotFoundError('Plan not found', 'PLAN_NOT_FOUND');
    }
    return plan.toJSON();
  }
}
