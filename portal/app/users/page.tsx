'use client';

import { useState, useEffect } from 'react';
import AuthWrapper from '@/components/auth/AuthWrapper';
import Layout from '@/components/layout/Layout';
import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { getUsers, createUser as createUserAPI, updateUser as updateUserAPI, deleteUser as deleteUserAPI, activateUser } from '@/lib/usersApi';
import AddUserModal from '@/components/users/AddUserModal';
import EditUserModal from '@/components/users/EditUserModal';
import ViewUserModal from '@/components/users/ViewUserModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Search, UserPlus, Eye, Edit, UserX, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ user: User; action: 'activate' | 'deactivate' } | null>(null);

    const limit = 10;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getUsers({
                page: currentPage,
                limit,
                search: searchTerm || undefined,
                role: roleFilter || undefined,
                isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                sortBy,
                sortOrder,
            });

            setUsers(response.data);
            setTotalPages(response.pagination.totalPages);
            setTotalUsers(response.pagination.total);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

    const handleCreateUser = async (data: CreateUserData) => {
        try {
            await createUserAPI(data);
            toast.success('User created successfully');
            fetchUsers();
            setShowAddModal(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to create user');
            throw error;
        }
    };

    const handleUpdateUser = async (id: string, data: UpdateUserData) => {
        try {
            await updateUserAPI(id, data);
            toast.success('User updated successfully');
            fetchUsers();
            setShowEditModal(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
            throw error;
        }
    };

    const handleDeactivateUser = (user: User) => {
        setConfirmAction({ user, action: user.isActive ? 'deactivate' : 'activate' });
        setShowConfirmModal(true);
    };

    const confirmDeactivateUser = async () => {
        if (!confirmAction) return;

        const { user, action } = confirmAction;
        try {
            if (action === 'deactivate') {
                await deleteUserAPI(user.id);
                toast.success('User deactivated successfully');
            } else {
                await activateUser(user.id);
                toast.success('User activated successfully');
            }
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || `Failed to ${action} user`);
        }
    };

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns: Column<User>[] = [
        {
            key: 'firstName',
            label: 'Name',
            sortable: true,
            render: (user: User) => (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.firstName} {user.lastName}
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (user: User) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (user: User) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (user: User) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}
                >
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'lastLoginAt',
            label: 'Last Login',
            sortable: true,
            render: (user: User) => (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </div>
            ),
        },
        {
            key: 'id',
            label: 'Actions',
            className: 'text-right',
            render: (user: User) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowViewModal(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View"
                    >
                        <Eye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowEditModal(true);
                        }}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        title="Edit"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivateUser(user);
                        }}
                        className={user.isActive ? "text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" : "text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AuthWrapper>
            <Layout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
                            <p className="text-gray-600 dark:text-gray-400">Manage users and their permissions</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            Create User
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                >
                                    <option value="">All Roles</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                    <option value="TENANT_ADMIN">Tenant Admin</option>
                                    <option value="USER">User</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    {loading && users.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                            </div>
                        </div>
                    ) : (
                        <DataTable
                            data={users}
                            columns={columns}
                            emptyMessage="No users found"
                            pagination={{
                                page: currentPage,
                                limit,
                                total: totalUsers,
                                totalPages,
                                hasNext: currentPage < totalPages,
                                hasPrev: currentPage > 1,
                            }}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>

                {/* Modals */}
                <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleCreateUser} />
                <EditUserModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdateUser}
                    user={selectedUser}
                />
                <ViewUserModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    onEdit={(user) => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                    }}
                    onDeactivate={handleDeactivateUser}
                    user={selectedUser}
                />
                <ConfirmModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmDeactivateUser}
                    title={confirmAction?.action === 'deactivate' ? 'Deactivate User' : 'Activate User'}
                    message={`Are you sure you want to ${confirmAction?.action} ${confirmAction?.user.firstName} ${confirmAction?.user.lastName}?`}
                    confirmText={confirmAction?.action === 'deactivate' ? 'Deactivate' : 'Activate'}
                    variant={confirmAction?.action === 'deactivate' ? 'danger' : 'info'}
                />
            </Layout>
        </AuthWrapper>
    );
}
