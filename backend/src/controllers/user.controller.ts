import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { container } from '../config/container';
import { logger } from '../config/logger';
import { createError } from '../utils/error';
import { UserRepository } from '../interfaces/user.interface';
import bcrypt from 'bcrypt';

export class UserController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = container.getRepository<UserRepository>('userRepository');
    }

    /**
     * Get all users with pagination and filtering
     */
    public getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError('Validation failed', 400, errors.array());
            }

            const user = req.user!;
            const {
                page = 1,
                limit = 10,
                search,
                role,
                isActive,
                sortBy = 'createdAt',
                sortOrder = 'desc',
            } = req.query;

            // For non-SUPER_ADMIN users, filter by their tenant
            const tenantId = user.role === 'SUPER_ADMIN' ? undefined : user.tenantId;

            const result = await this.userRepository.findByTenant(tenantId || '', {
                page: Number(page),
                limit: Number(limit),
                search: search as string,
                role: role as string,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'asc' | 'desc',
            });

            // Remove passwords from response
            const sanitizedData = result.data.map(({ password, ...user }) => user);

            logger.info('Users retrieved successfully', {
                userId: user.id,
                count: sanitizedData.length,
                tenantId
            });

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: sanitizedData,
                pagination: result.pagination,
            });
        } catch (error) {
            logger.error('Get all users failed', { error });
            next(error);
        }
    };

    /**
     * Get user by ID
     */
    public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError('Validation failed', 400, errors.array());
            }

            const { id } = req.params;
            const currentUser = req.user!;

            const user = await this.userRepository.findById(id);

            if (!user) {
                throw createError('User not found', 404);
            }

            // Check tenant access (except for SUPER_ADMIN)
            if (currentUser.role !== 'SUPER_ADMIN' && user.tenantId !== currentUser.tenantId) {
                throw createError('Access denied to this user', 403);
            }

            // Remove password from response
            const { password, ...sanitizedUser } = user;

            logger.info('User retrieved successfully', { userId: currentUser.id, targetUserId: id });

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: sanitizedUser,
            });
        } catch (error) {
            logger.error('Get user by ID failed', { error, userId: req.params.id });
            next(error);
        }
    };

    /**
     * Create a new user
     */
    public createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError('Validation failed', 400, errors.array());
            }

            const currentUser = req.user!;
            const { email, password, firstName, lastName, role = 'USER' } = req.body;

            // Check if user already exists
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw createError('User with this email already exists', 409);
            }

            // Prevent creating SUPER_ADMIN users
            if (role === 'SUPER_ADMIN') {
                throw createError('Cannot create SUPER_ADMIN users', 403);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user in the current user's tenant
            const newUser = await this.userRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role,
                tenantId: currentUser.tenantId,
                isActive: true,
            });

            // Remove password from response
            const { password: _, ...sanitizedUser } = newUser;

            logger.info('User created successfully', {
                createdBy: currentUser.id,
                newUserId: newUser.id,
                email: newUser.email
            });

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: sanitizedUser,
            });
        } catch (error) {
            logger.error('Create user failed', { error, email: req.body.email });
            next(error);
        }
    };

    /**
     * Update user
     */
    public updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError('Validation failed', 400, errors.array());
            }

            const { id } = req.params;
            const currentUser = req.user!;
            const { firstName, lastName, email, role, isActive } = req.body;

            // Get existing user
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                throw createError('User not found', 404);
            }

            // Check tenant access (except for SUPER_ADMIN)
            if (currentUser.role !== 'SUPER_ADMIN' && existingUser.tenantId !== currentUser.tenantId) {
                throw createError('Access denied to this user', 403);
            }

            // Prevent users from elevating their own role
            if (id === currentUser.id && role && role !== existingUser.role) {
                throw createError('Cannot change your own role', 403);
            }

            // Prevent creating SUPER_ADMIN users
            if (role === 'SUPER_ADMIN' && existingUser.role !== 'SUPER_ADMIN') {
                throw createError('Cannot elevate user to SUPER_ADMIN', 403);
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== existingUser.email) {
                const emailExists = await this.userRepository.findByEmail(email);
                if (emailExists) {
                    throw createError('Email already in use', 409);
                }
            }

            // Update user
            const updateData: any = {};
            if (firstName !== undefined) updateData.firstName = firstName;
            if (lastName !== undefined) updateData.lastName = lastName;
            if (email !== undefined) updateData.email = email;
            if (role !== undefined) updateData.role = role;
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedUser = await this.userRepository.update(id, updateData);

            // Remove password from response
            const { password, ...sanitizedUser } = updatedUser;

            logger.info('User updated successfully', {
                updatedBy: currentUser.id,
                targetUserId: id
            });

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: sanitizedUser,
            });
        } catch (error) {
            logger.error('Update user failed', { error, userId: req.params.id });
            next(error);
        }
    };

    /**
     * Soft delete user (deactivate)
     */
    public deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError('Validation failed', 400, errors.array());
            }

            const { id } = req.params;
            const currentUser = req.user!;

            // Prevent users from deleting themselves
            if (id === currentUser.id) {
                throw createError('Cannot delete your own account', 403);
            }

            // Get existing user
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                throw createError('User not found', 404);
            }

            // Check tenant access (except for SUPER_ADMIN)
            if (currentUser.role !== 'SUPER_ADMIN' && existingUser.tenantId !== currentUser.tenantId) {
                throw createError('Access denied to this user', 403);
            }

            // Soft delete (deactivate)
            await this.userRepository.deactivateUser(id);

            logger.info('User deactivated successfully', {
                deactivatedBy: currentUser.id,
                targetUserId: id
            });

            res.status(200).json({
                success: true,
                message: 'User deactivated successfully',
            });
        } catch (error) {
            logger.error('Delete user failed', { error, userId: req.params.id });
            next(error);
        }
    };
}

// Validation rules for user endpoints
export const userValidation = {
    getAllUsers: [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
        query('search').optional().isString().withMessage('Search must be a string'),
        query('role').optional().isIn(['SUPER_ADMIN', 'TENANT_ADMIN', 'USER']).withMessage('Invalid role'),
        query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
        query('sortBy').optional().isString().withMessage('sortBy must be a string'),
        query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
    ],

    getUserById: [
        // ID validation is handled by route parameter
    ],

    createUser: [
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
        body('role')
            .optional()
            .isIn(['TENANT_ADMIN', 'USER'])
            .withMessage('Role must be either TENANT_ADMIN or USER'),
    ],

    updateUser: [
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be between 2 and 50 characters'),
        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be between 2 and 50 characters'),
        body('role')
            .optional()
            .isIn(['TENANT_ADMIN', 'USER'])
            .withMessage('Role must be either TENANT_ADMIN or USER'),
        body('isActive')
            .optional()
            .isBoolean()
            .withMessage('isActive must be a boolean'),
    ],

    deleteUser: [
        // ID validation is handled by route parameter
    ],
};
