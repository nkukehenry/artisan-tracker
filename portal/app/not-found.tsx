'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-[180px] font-bold text-gray-200 leading-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-24 w-24 text-gray-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The page may have been moved, deleted, or never existed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Quick Links:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/devices"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Devices
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/remote-control"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Remote Control
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/messages"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Messages
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/call-logs"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Call Logs
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/contacts"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Contacts
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/location"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Location
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/media"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Media Files
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-gray-500">
          <p>Error Code: 404 - Page Not Found</p>
          <p className="mt-1">Mutindo Tracker © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

