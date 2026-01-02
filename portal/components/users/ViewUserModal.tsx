'use client';

import { X } from 'lucide-react';
import { User } from '@/types/user';
import { formatDateTime } from '@/lib/utils';

export interface ViewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (user: User) => void;
    onDeactivate: (user: User) => void;
    user: User | null;
}

export default function ViewUserModal({ isOpen, onClose, onEdit, onDeactivate, user }: ViewUserModalProps) {
    if (!isOpen || !user) return null;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
            case 'TENANT_ADMIN':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    return (
        <div className="fixed inset-0 bg-blue-900/20 dark:bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{user.firstName}</div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{user.lastName}</div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{user.email}</div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Role</label>
                            <div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                    {user.role.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Status</label>
                            <div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                        }`}
                                >
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Last Login</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</label>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{formatDateTime(user.createdAt)}</div>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">User ID</label>
                            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">{user.id}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                onEdit(user);
                                onClose();
                            }}
                            className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                onDeactivate(user);
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${user.isActive
                                    ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'
                                    : 'bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600'
                                }`}
                        >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
