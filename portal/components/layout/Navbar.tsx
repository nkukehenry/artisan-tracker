'use client';

import { 
  Menu,
  Search,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left section - Mobile menu button and Search */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search any Information"
              className="w-64 rounded-lg border-0 bg-gray-100 pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Right section - Notifications and Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </div>
  );
}

