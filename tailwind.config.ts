import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
          soft: '#DCFCE7',
          pale: '#F0FDF4',
        },
        slateText: '#64748B',
        ink: '#0F172A',
        border: '#E5E7EB',
        app: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'Kanit', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        kanit: ['Kanit', 'system-ui', 'sans-serif'],
        data: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        control: '12px',
        modal: '24px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(15, 23, 42, 0.04)',
        lift: '0 8px 28px rgba(15, 23, 42, 0.08)',
        modal: '0 24px 80px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
