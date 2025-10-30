'use client';

import {
  Menu,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import DeviceSelector from '@/components/devices/DeviceSelector';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white dark:bg-dark-background px-6">
      {/* Left section - Mobile menu button and Device Selector */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Device Selector */}
        <DeviceSelector className="max-w-md w-full" />
      </div>

      {/* Right section - Theme Toggle, Notifications and Profile */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        {/* <ThemeToggle /> */}

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </div>
  );
}

