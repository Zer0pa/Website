import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        'surface-container-low': '#1b1b1b',
        'surface-dim': '#131313',
        primary: '#ffffff',
        'surface-bright': '#393939',
        'on-surface': '#e2e2e2',
        outline: '#919191',
        'on-background': '#e2e2e2',
        'surface-container': '#1f1f1f',
        'surface-container-high': '#2a2a2a',
        'on-surface-variant': '#c6c6c6',
        secondary: '#c7c6c6',
        error: '#ffb4ab',
      },
      fontFamily: {
        oswald: ['var(--font-oswald-next)', 'Oswald', 'sans-serif'],
        mono: ['var(--font-courier-next)', 'Courier Prime', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px',
      },
    },
  },
};

export default config;
