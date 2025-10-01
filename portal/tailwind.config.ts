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
        // Configurable theme colors based on the Ship Sense design
        sidebar: {
          DEFAULT: '#1A202C', // Dark blue/charcoal
          border: '#2D3748', // Lighter dark blue for borders
          active: '#2D3748', // Active item background
          hover: '#2D3748', // Hover state
          text: '#CBD5E0', // Light gray text
          icon: '#A0AEC0', // Icon color
        },
        primary: {
          DEFAULT: '#6B46C1', // Purple
          hover: '#553C9A', // Darker purple on hover
        },
        chart: {
          green: '#48BB78', // Chart green
          blue: '#4299E1', // Chart blue
        },
        status: {
          maintenance: {
            bg: '#DBEAFE',
            text: '#2563EB',
          },
          port: {
            bg: '#D1FAE5',
            text: '#059669',
          },
          transit: {
            bg: '#FFEDD5',
            text: '#F97316',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;