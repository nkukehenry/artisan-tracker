'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Smartphone,
  MessageSquare,
  Phone,
  Users,
  MapPin,
  Grid3X3,
  Plus,
  X,
  Monitor,
  FileImage,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Device Information', href: '/devices', icon: Smartphone },
  { name: 'Remote Control', href: '/remote-control', icon: Monitor },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Call Logs', href: '/call-logs', icon: Phone },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Location', href: '/location', icon: MapPin },
  { name: 'Media Files', href: '/media', icon: FileImage },
  // { name: 'App Activities', href: '/app-activities', icon: Grid3X3 },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
        <div className="flex items-center gap-2 py-4">
          <div className="h-8 w-8 rounded-lg bg-blue-800 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Mutindo Tracker</h1>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                group flex items-center rounded-lg px-3 py-4 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-gray-800 text-blue-300'
                  : 'text-white hover:bg-gray-800'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-300' : 'text-white'}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Add Device Button */}
      {/* <div className="px-3 pb-4">
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-900">
          <Plus className="h-4 w-4" />
          Add Device
        </button>
      </div> */}

      {/* Footer */}
      {/* <div className="border-t border-gray-800 p-4">
        <div className="space-y-2">
          <Link href="/docs" className="block text-xs text-white hover:text-gray-300 transition-colors">
            Documentation
          </Link>
          <Link href="/faq" className="block text-xs text-white hover:text-gray-300 transition-colors">
            FAQ
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-white">© 2025 Mutindo</p>
      </div> */}
    </div>
  );
}

