/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '!./src/**/*.test.{js,ts,jsx,tsx,mdx}',
    '!./src/**/*.spec.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        desktop: '1440px',
      },
      colors: {
        // ── Umay Semantic Palette (RGB triplets) ──
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        'text-subtle': 'rgb(var(--text-subtle) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
          subtle: 'rgb(var(--accent-subtle) / <alpha-value>)',
          foreground: 'rgb(var(--on-accent) / <alpha-value>)',
        },
        'on-accent': 'rgb(var(--on-accent) / <alpha-value>)',
        ember: 'rgb(var(--ember) / <alpha-value>)',

        // ── Status Colors ──
        success: {
          DEFAULT: 'rgb(var(--success) / <alpha-value>)',
          subtle: 'rgb(var(--success-subtle) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning) / <alpha-value>)',
          subtle: 'rgb(var(--warning-subtle) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger) / <alpha-value>)',
          subtle: 'rgb(var(--danger-subtle) / <alpha-value>)',
        },
        error: 'rgb(var(--danger) / <alpha-value>)',
        info: {
          DEFAULT: 'rgb(var(--info) / <alpha-value>)',
          subtle: 'rgb(var(--info-subtle) / <alpha-value>)',
        },

        // ── Category Dot Colors ──
        'cat-1': 'rgb(var(--cat-1) / <alpha-value>)',
        'cat-2': 'rgb(var(--cat-2) / <alpha-value>)',
        'cat-3': 'rgb(var(--cat-3) / <alpha-value>)',
        'cat-4': 'rgb(var(--cat-4) / <alpha-value>)',
        'cat-5': 'rgb(var(--cat-5) / <alpha-value>)',
        'cat-6': 'rgb(var(--cat-6) / <alpha-value>)',
        'cat-7': 'rgb(var(--cat-7) / <alpha-value>)',
        'cat-8': 'rgb(var(--cat-8) / <alpha-value>)',

        // ── shadcn & Tulpar Compatibility Aliases ──
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: 'rgb(var(--muted) / <alpha-value>)',
        'muted-foreground': 'rgb(var(--muted-foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-foreground': 'rgb(var(--card-foreground) / <alpha-value>)',
        popover: 'rgb(var(--popover) / <alpha-value>)',
        'popover-foreground': 'rgb(var(--popover-foreground) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',

        'void-black': 'rgb(var(--void-black) / <alpha-value>)',
        obsidian: 'rgb(var(--obsidian) / <alpha-value>)',
        gunmetal: 'rgb(var(--gunmetal) / <alpha-value>)',
        titanium: 'rgb(var(--titanium) / <alpha-value>)',
        ash: 'rgb(var(--ash) / <alpha-value>)',
        'tulpar-blue': 'rgb(var(--tulpar-blue) / <alpha-value>)',
        'umay-blue': 'rgb(var(--umay-blue) / <alpha-value>)',
        'umay-accent': 'rgb(var(--umay-accent) / <alpha-value>)',
        'umay-gold': 'rgb(var(--umay-gold) / <alpha-value>)',
        'umay-firuze': 'rgb(var(--umay-firuze) / <alpha-value>)',
        'umay-cosmic': 'rgb(var(--umay-cosmic) / <alpha-value>)',
        'signal-green': 'rgb(var(--signal-green) / <alpha-value>)',
        'alert-red': 'rgb(var(--alert-red) / <alpha-value>)',
      },

      fontFamily: {
        sans: [
          'var(--font-body)',
          'system-ui',
          '-apple-system',
          "'Segoe UI'",
          'sans-serif',
        ],
        heading: [
          'var(--font-heading)',
          'var(--font-body)',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'var(--font-heading)',
          'var(--font-body)',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },

      fontSize: {
        display: [
          '1.75rem',
          {
            lineHeight: '2.25rem',
            letterSpacing: '-0.01em',
            fontWeight: '700',
          },
        ],
        'display-sm': [
          '1.5rem',
          { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
        title: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        metric: ['1.75rem', { lineHeight: '2rem', fontWeight: '700' }],
        compact: ['0.6875rem', { lineHeight: '1rem' }],
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      borderRadius: {
        DEFAULT: '8px',
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },

      boxShadow: {
        float: 'var(--shadow-float)',
      },

      minWidth: {
        table: '760px',
      },

      maxHeight: {
        dialog: 'calc(100vh - 2rem)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 180ms ease-out',
        'accordion-up': 'accordion-up 180ms ease-out',
        'fade-in': 'fade-in 180ms ease-out',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};

export default config;
