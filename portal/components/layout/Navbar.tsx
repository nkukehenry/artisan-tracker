'use client';

import { 
  Bell, 
  User,
  Menu,
  Search,
} from 'lucide-react';

export default function Navbar() {
  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left section - Mobile menu button and Search */}
      <div className="flex items-center gap-4">
        <button
          type="button"
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
              className="w-64 rounded-lg border-0 bg-gray-100 pl-10 pr-4 py-2 text-sm placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Right section - Notifications and Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="View notifications"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white ring-2 ring-white">
            5
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">John Doe</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <button
            type="button"
            className="rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Open user menu"
          >
            <User className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  );
}

