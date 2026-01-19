/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#E8F3FF',
          100: '#E8F3FF',
          400: '#A7CCFF',
          500: '#3182F6',
          600: '#3182F6',
          700: '#1B64DA',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F2F4F6',
          200: '#E5E8EB',
          300: '#E5E8EB',
          400: '#8B95A1',
          500: '#6B7684',
          700: '#333D4B',
          900: '#191F28',
        },
        toss: {
          blue: '#3182F6',
          'blue-light': '#E8F3FF',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F2F4F6',
          200: '#E5E8EB',
          400: '#8B95A1',
          500: '#6B7684',
          700: '#333D4B',
          900: '#191F28',
        },
        success: '#00C853',
        warning: '#FF9100',
        error: '#F44336',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
