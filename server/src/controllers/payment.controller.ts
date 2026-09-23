import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';

export class PaymentController {
  static initiate = async (req: Request, res: Response) => {
    const { planId, couponCode, referralCode } = req.body;
    const result = await PaymentService.initiatePayment(
      req.userId!,
      planId,
      couponCode,
      referralCode
    );
    res.status(200).json({
      success: true,
      data: result,
      message: 'Payment order initiated',
    });
  };

  static verify = async (req: Request, res: Response) => {
    const result = await PaymentService.verifyPayment(req.userId!, req.body);
    res.status(200).json({
      success: true,
      data: result,
      message: result.message || 'Payment verified',
    });
  };

  static manualPayment = async (req: Request, res: Response) => {
    const result = await PaymentService.recordManualPayment(req.userId!, req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Manual payment recorded and membership activated',
    });
  };

  static getMyPayments = async (req: Request, res: Response) => {
    const payments = await PaymentService.getMyPayments(req.userId!);
    res.status(200).json({
      success: true,
      data: payments,
    });
  };

  static listPayments = async (req: Request, res: Response) => {
    const result = await PaymentService.listPayments(req.query as any);
    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
