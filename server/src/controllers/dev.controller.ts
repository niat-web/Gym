import { Request, Response } from 'express';
import {
  runExpireSubscriptionsJob,
  runDeactivateExpiredCouponsJob,
  runRenewalAlertsJob,
} from '../jobs/index.js';
import { env } from '../config/env.js';
import { ValidationError, ForbiddenError } from '../utils/AppError.js';

export class DevController {
  static runJob = async (req: Request, res: Response) => {
    if (env.NODE_ENV === 'production') {
      throw new ForbiddenError('Dev trigger route is disabled in production environment');
    }

    const { name } = req.params;
    let result: any;

    switch (name) {
      case 'expire-subscriptions':
        result = await runExpireSubscriptionsJob();
        break;
      case 'deactivate-coupons':
        result = await runDeactivateExpiredCouponsJob();
        break;
      case 'renewal-alerts':
        result = await runRenewalAlertsJob();
        break;
      default:
        throw new ValidationError(
          `Unknown job name: '${name}'. Allowed jobs: 'expire-subscriptions', 'deactivate-coupons', 'renewal-alerts'`,
          'name'
        );
    }

    res.status(200).json({
      success: true,
      data: result,
      message: `Job '${name}' executed successfully`,
    });
  };
}
