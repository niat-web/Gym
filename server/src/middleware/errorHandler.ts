import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        field: err.field,
      },
    });
    return;
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const field = firstIssue ? firstIssue.path.join('.') : undefined;
    const message = firstIssue ? firstIssue.message : 'Invalid request payload';

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        field,
        issues: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
    return;
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000 && err.keyPattern) {
    const field = Object.keys(err.keyPattern)[0] || 'field';
    let code = 'DUPLICATE_KEY';
    let message = `${field} already exists`;

    if (field === 'phone') {
      code = 'PHONE_ALREADY_EXISTS';
      message = 'Phone number is already registered';
    } else if (field === 'email') {
      code = 'EMAIL_ALREADY_EXISTS';
      message = 'Email address is already in use';
    } else if (field === 'code') {
      code = 'COUPON_ALREADY_EXISTS';
      message = 'Coupon code already exists';
    } else if (field === 'receiptNumber') {
      code = 'RECEIPT_ALREADY_EXISTS';
      message = 'Receipt number collision';
    }

    res.status(409).json({
      success: false,
      error: {
        code,
        message,
        field,
      },
    });
    return;
  }

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const firstError = Object.values(err.errors)[0];
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: firstError ? firstError.message : 'Database validation failed',
        field: firstError ? firstError.path : undefined,
      },
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid identifier format for ${err.path}`,
        field: err.path,
      },
    });
    return;
  }

  // Unhandled / Internal Server Error
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled Exception in Request'
  );

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
    },
  });
};
