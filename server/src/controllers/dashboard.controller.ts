import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  static getOwnerDashboard = async (req: Request, res: Response) => {
    const data = await DashboardService.getOwnerDashboard();
    res.status(200).json({
      success: true,
      data,
    });
  };

  static getTrainerDashboard = async (req: Request, res: Response) => {
    const data = await DashboardService.getTrainerDashboard(req.userId!);
    res.status(200).json({
      success: true,
      data,
    });
  };
}
