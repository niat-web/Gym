export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly field?: string;
  public readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.field = field;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHENTICATED') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied', code = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(404, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT', field?: string) {
    super(409, code, message, field);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', field?: string, code = 'VALIDATION_ERROR') {
    super(422, code, message, field);
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment processing failed', code = 'PAYMENT_ERROR') {
    super(400, code, message);
  }
}
