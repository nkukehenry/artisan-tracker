'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { User, UpdateUserData } from '@/types/user';

export interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, data: UpdateUserData) => Promise<void>;
    user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onUpdate, user }: EditUserModalProps) {
    const [formData, setFormData] = useState<UpdateUserData>({
        firstName: '',
        lastName: '',
        email: '',
        role: 'USER',
        isActive: true,
    });
    const [errors, setErrors] = useState<Partial<UpdateUserData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role as 'USER' | 'TENANT_ADMIN',
                isActive: user.isActive,
            });
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const validateForm = (): boolean => {
        const newErrors: Partial<UpdateUserData> = {};

        if (!formData.firstName?.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            setIsSubmitting(true);
            try {
                await onUpdate(user.id, formData);
                setErrors({});
                onClose();
            } catch (error) {
                // Error is handled by parent component
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleInputChange = (field: keyof UpdateUserData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as keyof Partial<UpdateUserData>]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <div className="fixed inset-0 bg-blue-900/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit User</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.firstName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                placeholder="John"
                            />
                            {errors.firstName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.firstName}</p>}
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.lastName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                placeholder="Doe"
                            />
                            {errors.lastName && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.lastName}</p>}
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                placeholder="john.doe@example.com"
                            />
                            {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role *
                            </label>
                            <select
                                id="role"
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value as 'USER' | 'TENANT_ADMIN')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value="USER">User</option>
                                <option value="TENANT_ADMIN">Tenant Admin</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                id="isActive"
                                value={formData.isActive ? 'true' : 'false'}
                                onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Updating...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
