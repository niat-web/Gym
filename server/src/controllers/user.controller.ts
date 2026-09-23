import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';

export class UserController {
  static getMe = async (req: Request, res: Response) => {
    const user = await UserService.getMe(req.userId!);
    res.status(200).json({
      success: true,
      data: user,
    });
  };

  static updateMe = async (req: Request, res: Response) => {
    const updated = await UserService.updateProfile(req.userId!, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Profile updated successfully',
    });
  };

  static listUsers = async (req: Request, res: Response) => {
    const result = await UserService.listUsers(req.query as any);
    res.status(200).json({
      success: true,
      data: result,
    });
  };

  static createUser = async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  };

  static listTrainers = async (req: Request, res: Response) => {
    const trainers = await UserService.listTrainers();
    res.status(200).json({
      success: true,
      data: trainers,
    });
  };

  static getUserById = async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  };

  static updateStatus = async (req: Request, res: Response) => {
    const user = await UserService.updateUserStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      data: user,
      message: `User status changed to ${req.body.status}`,
    });
  };

  static assignTrainer = async (req: Request, res: Response) => {
    const user = await UserService.assignTrainer(req.params.id, req.body.trainerId);
    res.status(200).json({
      success: true,
      data: user,
      message: 'Trainer assigned successfully',
    });
  };

  static getQrPass = async (req: Request, res: Response) => {
    const qrPayload = await UserService.getQrPassPayload(req.params.id);
    res.status(200).json({
      success: true,
      data: qrPayload,
    });
  };
}
