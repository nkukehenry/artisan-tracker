import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact colors from Ship Sense design
        sidebar: {
          DEFAULT: '#1A202C', // Dark blue/charcoal background
          border: '#2D3748', // Border color
          active: '#2D3748', // Active item background (lighter dark blue)
          hover: '#2D3748', // Hover state
          text: '#FFFFFF', // White text for navigation items
          icon: '#FFFFFF', // White icons
        },
            primary: {
              DEFAULT: '#1E3A8A', // Navy for buttons
              hover: '#1E40AF', // Darker navy on hover
            },
        chart: {
          green: '#48BB78', // Chart green
          blue: '#4299E1', // Chart blue
        },
        status: {
          maintenance: {
            bg: '#DBEAFE', // Light blue background
            text: '#2563EB', // Blue text
          },
          port: {
            bg: '#D1FAE5', // Light green background
            text: '#059669', // Green text
          },
          transit: {
            bg: '#FFEDD5', // Light orange background
            text: '#F97316', // Orange text
          },
        },
        // Additional colors for exact match
        search: {
          bg: '#F3F4F6', // Light gray search background
          text: '#6B7280', // Gray placeholder text
        },
        notification: {
          bg: '#EF4444', // Red notification badge
        },
      },
    },
  },
  plugins: [],
};

export default config;