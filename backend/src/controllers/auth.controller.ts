import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { container } from '../config/container';
import { logger } from '../config/logger';
import { createError } from '../utils/error';
import { IAuthService } from '../interfaces/auth.interface';

export class AuthController {
  private authService: IAuthService;

  constructor() {
    this.authService = container.getService<IAuthService>('authService');
  }

  /**
   * Register a new user and tenant
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { email, password, firstName, lastName, tenantName, domain } = req.body;

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        tenantName,
        domain,
      });

      logger.info('User registration successful', { email, tenantName });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      logger.error('User registration failed', { error, body: req.body });
      next(error);
    }
  };

  /**
   * Login user
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { email, password } = req.body;

      const result = await this.authService.login(email, password);

      logger.info('User login successful', { email, userId: result.user.id });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      logger.error('User login failed', { error, email: req.body.email });
      next(error);
    }
  };

  /**
   * Refresh access token
   */
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { refreshToken } = req.body;

      const tokens = await this.authService.refreshToken(refreshToken);

      logger.info('Token refresh successful');

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      logger.error('Token refresh failed', { error });
      next(error);
    }
  };

  /**
   * Logout user
   */
  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError('Validation failed', 400, errors.array());
      }

      const { refreshToken } = req.body;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!accessToken) {
        throw createError('Access token is required', 400);
      }

      await this.authService.logout(refreshToken);

      logger.info('User logout successful');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('User logout failed', { error });
      next(error);
    }
  };

  /**
   * Get current user profile
   */
  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user; // Set by auth middleware

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            tenantId: user.tenantId,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
          },
        },
      });
    } catch (error) {
      logger.error('Get profile failed', { error });
      next(error);
    }
  };
}

// Validation rules for auth endpoints
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('tenantName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Tenant name must be between 2 and 100 characters'),
    body('tenantDomain')
      .optional()
      .isURL({ require_protocol: false })
      .withMessage('Tenant domain must be a valid URL'),
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  refreshToken: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],

  logout: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
  ],
};
