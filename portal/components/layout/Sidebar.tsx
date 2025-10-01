'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Smartphone,
  Image,
  MessageSquare,
  Phone,
  Users,
  MapPin,
  Grid3X3,
  Plus,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Devices', href: '/devices', icon: Smartphone },
  { name: 'Media', href: '/media', icon: Image },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Call Logs', href: '/call-logs', icon: Phone },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Locations', href: '/locations', icon: MapPin },
  { name: 'App Activities', href: '/app-activities', icon: Grid3X3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Mutindo Tracker</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-sidebar-icon group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Add Device Button */}
      <div className="px-3 pb-4">
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
          <Plus className="h-4 w-4" />
          Add Device
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <Link href="/docs" className="block text-xs text-sidebar-text hover:text-white transition-colors">
            Documentation
          </Link>
          <Link href="/faq" className="block text-xs text-sidebar-text hover:text-white transition-colors">
            FAQ
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-sidebar-text">© 2025 Mutindo</p>
      </div>
    </div>
  );
}

