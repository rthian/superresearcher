/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0891b2', // cyan-600
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        insight: {
          painPoint: '#ef4444',    // red-500
          opportunity: '#10b981',   // green-500
          behavior: '#3b82f6',      // blue-500
          preference: '#a855f7',    // purple-500
          unmetNeed: '#f97316',     // orange-500
          bugReport: '#ec4899',     // pink-500
          positive: '#059669',      // emerald-600
        },
        impact: {
          high: '#dc2626',    // red-600
          medium: '#ca8a04',  // yellow-600
          low: '#6b7280',     // gray-500
        },
      },
    },
  },
  plugins: [],
}

