import { Request, Response } from 'express';
import { CheckInService } from '../services/checkin.service.js';

export class CheckInController {
  static checkIn = async (req: Request, res: Response) => {
    const result = await CheckInService.processCheckIn(req.userId!, req.body);
    res.status(200).json({
      success: true,
      data: result,
      message: result.message,
    });
  };

  static getToday = async (req: Request, res: Response) => {
    const todayList = await CheckInService.getTodayCheckIns();
    res.status(200).json({
      success: true,
      data: todayList,
    });
  };

  static getHistory = async (req: Request, res: Response) => {
    // If member calls, they can only view their own; trainers/admin can specify memberId
    let targetMemberId = req.userId!;
    if (req.userRole !== 'member' && req.query.memberId) {
      targetMemberId = req.query.memberId as string;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const history = await CheckInService.getMemberAttendanceHistory(targetMemberId, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  };
}
