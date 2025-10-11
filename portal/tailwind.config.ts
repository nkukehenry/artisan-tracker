import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors (default)
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
        },
        foreground: {
          DEFAULT: '#171717',
          secondary: '#6B7280',
        },
        // Dark mode colors
        dark: {
          background: {
            DEFAULT: '#0F172A', // Dark slate
            secondary: '#1E293B', // Slightly lighter dark
          },
          foreground: {
            DEFAULT: '#F1F5F9', // Light gray
            secondary: '#94A3B8', // Muted light gray
          },
        },
        // Exact colors from Ship Sense design
        sidebar: {
          DEFAULT: '#1A202C', // Dark blue/charcoal background
          border: '#2D3748', // Border color
          active: '#2D3748', // Active item background (lighter dark blue)
          hover: '#2D3748', // Hover state
          text: '#FFFFFF', // White text for navigation items
          icon: '#FFFFFF', // White icons
          // Dark mode variants
          dark: {
            DEFAULT: '#0F172A', // Even darker for dark mode
            border: '#1E293B',
            active: '#1E293B',
            hover: '#1E293B',
            text: '#F1F5F9',
            icon: '#F1F5F9',
          },
        },
        primary: {
          DEFAULT: '#1E3A8A', // Navy for buttons
          hover: '#1E40AF', // Darker navy on hover
          dark: {
            DEFAULT: '#3B82F6', // Brighter blue for dark mode
            hover: '#2563EB',
          },
        },
        chart: {
          green: '#48BB78', // Chart green
          blue: '#4299E1', // Chart blue
          dark: {
            green: '#10B981', // Brighter green for dark mode
            blue: '#60A5FA', // Brighter blue for dark mode
          },
        },
        status: {
          maintenance: {
            bg: '#DBEAFE', // Light blue background
            text: '#2563EB', // Blue text
            dark: {
              bg: '#1E3A8A', // Dark blue background
              text: '#93C5FD', // Light blue text
            },
          },
          port: {
            bg: '#D1FAE5', // Light green background
            text: '#059669', // Green text
            dark: {
              bg: '#064E3B', // Dark green background
              text: '#6EE7B7', // Light green text
            },
          },
          transit: {
            bg: '#FFEDD5', // Light orange background
            text: '#F97316', // Orange text
            dark: {
              bg: '#9A3412', // Dark orange background
              text: '#FED7AA', // Light orange text
            },
          },
        },
        // Additional colors for exact match
        search: {
          bg: '#F3F4F6', // Light gray search background
          text: '#6B7280', // Gray placeholder text
          dark: {
            bg: '#1E293B', // Dark gray search background
            text: '#94A3B8', // Light gray placeholder text
          },
        },
        notification: {
          bg: '#EF4444', // Red notification badge
          dark: {
            bg: '#DC2626', // Darker red for dark mode
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;