import { Request, Response } from 'express';
import { PlanService } from '../services/plan.service.js';

export class PlanController {
  static getActivePlans = async (req: Request, res: Response) => {
    const plans = await PlanService.getActivePlans();
    res.status(200).json({
      success: true,
      data: plans,
    });
  };

  static getAllPlans = async (req: Request, res: Response) => {
    const plans = await PlanService.getAllPlans();
    res.status(200).json({
      success: true,
      data: plans,
    });
  };

  static getPlanById = async (req: Request, res: Response) => {
    const plan = await PlanService.getPlanById(req.params.id);
    res.status(200).json({
      success: true,
      data: plan,
    });
  };

  static createPlan = async (req: Request, res: Response) => {
    const plan = await PlanService.createPlan(req.body);
    res.status(201).json({
      success: true,
      data: plan,
      message: 'Fitness plan created successfully',
    });
  };

  static updatePlan = async (req: Request, res: Response) => {
    const plan = await PlanService.updatePlan(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: plan,
      message: 'Fitness plan updated successfully',
    });
  };

  static activatePlan = async (req: Request, res: Response) => {
    const plan = await PlanService.setPlanStatus(req.params.id, true);
    res.status(200).json({
      success: true,
      data: plan,
      message: 'Plan activated successfully',
    });
  };

  static deactivatePlan = async (req: Request, res: Response) => {
    const plan = await PlanService.setPlanStatus(req.params.id, false);
    res.status(200).json({
      success: true,
      data: plan,
      message: 'Plan deactivated successfully',
    });
  };
}
