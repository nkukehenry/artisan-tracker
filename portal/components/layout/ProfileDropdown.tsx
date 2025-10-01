'use client';

import { User, Settings, LogOut, UserCircle, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/appSlice';
import Dropdown from '../ui/Dropdown';

interface ProfileDropdownProps {
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

export default function ProfileDropdown({ 
  userName, 
  userRole,
  userEmail
}: ProfileDropdownProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Use Redux state if props not provided
  const displayName = userName || `${user?.firstName} ${user?.lastName}` || 'User';
  const displayRole = userRole || user?.role || 'USER';
  const displayEmail = userEmail || user?.email || '';
  const handleProfile = () => {
    // TODO: Navigate to profile page
    console.log('Open profile');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings page
    console.log('Open settings');
  };

  const handleLogout = () => {
    dispatch(addToast({
      type: 'info',
      title: 'Logging Out',
      message: 'You have been successfully logged out.',
    }));
    dispatch(logoutUser());
  };

  const dropdownItems = [
    {
      label: 'Profile',
      icon: User,
      onClick: handleProfile,
    },
    {
      label: 'Settings',
      icon: Settings,
      onClick: handleSettings,
    },
    {
      label: 'divider',
      onClick: () => {},
      divider: true,
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{displayName}</p>
            <p className="text-xs text-gray-500">{displayRole}</p>
          </div>
          <div className="relative">
            <UserCircle className="h-8 w-8 text-gray-500" />
            {displayRole === 'SUPER_ADMIN' && (
              <Shield className="absolute -bottom-1 -right-1 h-4 w-4 text-blue-600 bg-white rounded-full" />
            )}
          </div>
        </div>
      }
      items={dropdownItems}
      align="right"
    />
  );
}
