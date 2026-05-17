import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: '#FAF7F2',
        night: '#1A1814',
        ayah: '#B8860B',
        hadith: '#5F7A5A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        amiri: ['"Amiri"', 'serif'],
        quran: ['"Amiri Quran"', '"Amiri"', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
