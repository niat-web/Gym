import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscription.service.js';

export class SubscriptionController {
  static getMyActive = async (req: Request, res: Response) => {
    const subscription = await SubscriptionService.getMyActiveSubscription(req.userId!);
    res.status(200).json({
      success: true,
      data: subscription,
    });
  };

  static getMyHistory = async (req: Request, res: Response) => {
    const history = await SubscriptionService.getMySubscriptionHistory(req.userId!);
    res.status(200).json({
      success: true,
      data: history,
    });
  };

  static getExpiring = async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    const expiring = await SubscriptionService.getExpiringSubscriptions(days);
    res.status(200).json({
      success: true,
      data: expiring,
    });
  };

  static getById = async (req: Request, res: Response) => {
    const subscription = await SubscriptionService.getSubscriptionById(req.params.id);
    res.status(200).json({
      success: true,
      data: subscription,
    });
  };

  static pause = async (req: Request, res: Response) => {
    const subscription = await SubscriptionService.pauseSubscription(req.params.id);
    res.status(200).json({
      success: true,
      data: subscription,
      message: 'Subscription paused successfully',
    });
  };

  static resume = async (req: Request, res: Response) => {
    const subscription = await SubscriptionService.resumeSubscription(req.params.id);
    res.status(200).json({
      success: true,
      data: subscription,
      message: 'Subscription resumed successfully',
    });
  };

  static cancel = async (req: Request, res: Response) => {
    const subscription = await SubscriptionService.cancelSubscription(req.params.id);
    res.status(200).json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully',
    });
  };
}
