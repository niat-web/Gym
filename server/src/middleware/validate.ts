import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schema: ValidationSchema | ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('parseAsync' in schema && typeof (schema as any).parseAsync === 'function' && !('body' in schema || 'query' in schema || 'params' in schema)) {
        req.body = await (schema as ZodTypeAny).parseAsync(req.body);
      } else {
        const complexSchema = schema as ValidationSchema;
        if (complexSchema.body) {
          req.body = await complexSchema.body.parseAsync(req.body);
        }
        if (complexSchema.query) {
          req.query = await complexSchema.query.parseAsync(req.query);
        }
        if (complexSchema.params) {
          req.params = await complexSchema.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
