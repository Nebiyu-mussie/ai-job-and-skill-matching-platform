import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.model';
import { AuthRequest } from './auth.middleware';

export const auditLog = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const start = Date.now();

    res.on('finish', async () => {
      try {
        await AuditLog.create({
          user: req.user?._id,
          action,
          resource,
          resourceId: req.params.id,
          details: {
            body: sanitizeBody(req.body),
            query: req.query,
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: Date.now() - start,
          level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
        });
      } catch {
        // Audit log failures should not break request
      }
    });

    next();
  };
};

const sanitizeBody = (body: any): any => {
  if (!body) return {};
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) sanitized[field] = '***REDACTED***';
  });
  return sanitized;
};
