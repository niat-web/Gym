import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static register = async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Account registered successfully',
    });
  };

  static login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    const result = await AuthService.login(phone, password);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Logged in successfully',
    });
  };

  static refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Token rotated successfully',
    });
  };

  static logout = async (req: Request, res: Response) => {
    await AuthService.logout(req.userId!);
    res.status(200).json({
      success: true,
      data: null,
      message: 'Logged out successfully',
    });
  };

  static changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await AuthService.changePassword(req.userId!, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      data: null,
      message: result.message,
    });
  };

  static sendOtp = async (req: Request, res: Response) => {
    const { phone } = req.body;
    const result = await AuthService.sendPasswordResetOtp(phone);
    res.status(200).json({
      success: true,
      data: result.devOtp ? { devOtp: result.devOtp } : null,
      message: result.message,
    });
  };

  static verifyOtp = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    const result = await AuthService.verifyPasswordResetOtp(phone, otp);
    res.status(200).json({
      success: true,
      data: result,
      message: 'OTP verified successfully',
    });
  };

  static resetPassword = async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;
    const result = await AuthService.resetPassword(resetToken, newPassword);
    res.status(200).json({
      success: true,
      data: null,
      message: result.message,
    });
  };
}
