/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/_document.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'moondream-blue': '#1e40af',
        'moondream-purple': '#8b5cf6',
        'moondream-dark': '#0d0d0d',
        'gradient-start': '#8B5CF6',
        'gradient-end': '#06B6D4',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'starfield': "url('/starfield.svg')",
      },
      fontFamily: {
        sans: ["'Sora'", 'Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
} 