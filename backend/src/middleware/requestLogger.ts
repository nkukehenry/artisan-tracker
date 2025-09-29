import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log request details
  const requestData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };

  logger.info('Incoming Request', requestData);

  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    const responseData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Request Completed with Server Error', responseData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request Completed with Client Error', responseData);
    } else {
      logger.info('Request Completed Successfully', responseData);
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;
