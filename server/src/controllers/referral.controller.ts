import { Request, Response } from 'express';
import { ReferralService } from '../services/referral.service.js';

export class ReferralController {
  static getMyReferral = async (req: Request, res: Response) => {
    const result = await ReferralService.getMyReferral(req.userId!);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  static getAdminSummary = async (req: Request, res: Response) => {
    const result = await ReferralService.getAdminReferralSummary();
    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
