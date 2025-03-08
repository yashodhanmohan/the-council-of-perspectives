import type { Config } from 'tailwindcss';

export default {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(215, 90%, 30%)',
          foreground: 'hsl(45, 90%, 95%)',
        },
        secondary: {
          DEFAULT: 'hsl(45, 90%, 45%)',
          foreground: 'hsl(215, 90%, 15%)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(215, 15%, 90%)',
          foreground: 'hsl(215, 15%, 35%)',
        },
        accent: {
          DEFAULT: 'hsl(45, 90%, 50%)',
          foreground: 'hsl(215, 90%, 25%)',
        },
        popover: {
          DEFAULT: 'hsl(215, 15%, 98%)',
          foreground: 'hsl(215, 90%, 15%)',
        },
        card: {
          DEFAULT: 'hsl(215, 15%, 100%)',
          foreground: 'hsl(215, 90%, 15%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;
