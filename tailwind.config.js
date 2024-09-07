/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Roboto Flex', 'Roboto', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['Roboto Flex', 'Roboto', 'Open Sans', 'Helvetica Neue', 'monospace'],
      },
      colors: {
        'main-bg-light': '#F0F0F0',
        'main-bg-dark': '#1F1F1F',
        'text-light': '#1C1C1E',
        'text-dark': '#E0E0E0',
        'login-btn': '#D77D4E',
        'login-btn-focus': '#B65A38',
        'register-hover-light': '#4A4A4A',
        'register-hover-dark': '#9A9A9A',
        'border-light': '#D3D3D3',
        'border-dark': '#4D4D4D',
        'login-bg-light': '#FFFFFF',
        'login-bg-dark': '#2A2A2A',
        'lists-bg-light': '#FFFFFF',
        'lists-bg-dark': '#2A2A2A',
        'lists-hover-light': '#F5F5F5',
        'lists-hover-dark': '#3A3A3A',
        'add-item': '#D69E2E',
        'add-item-hover-dark': '#F6E05E',
        'add-item-hover-light': '#B7791F',
        'list-item-count-light': '#4B5563',
        'list-item-count-dark': '#9CA3AF',
        'input-border-light': '#D1D5DB',
        'input-border-dark': '#4B5563',
        'input-bg-dark': '#374151',
        'input-text-dark': '#D1D5DB',
        'button-blue': '#3B82F6',
        'button-blue-hover-light': '#2563EB',
        'button-blue-hover-dark': '#93C5FD',
        'button-disabled': '#D1D5DB',
        'fail-toast-bg-light': 'rgba(255, 99, 71, 0.2)',
        'fail-toast-bg-dark': 'rgba(220, 20, 60, 0.2)',
        'fail-toast-text': '#FF6B6B',
        'list-shared-dark': '#9CA3AF',
        'list-shared-light': '#4B5563',
        'delete-btn-light': '#C53030',
        'delete-btn-light-hover': '#E53E3E',
        'delete-btn': '#C53030',
        'delete-btn-hover': '#E53E3E', 
      },
      boxShadow: {
        ios: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'column-width': '42rem',
        'column-margin-top': '4rem',
        'divider': '1px', // For the divider line
      },
      fontSize: {
        'icon-xl': '1.5rem',
        'icon-lg': '1.25rem',
      },
      animation: {
        swipeReveal: 'swipeReveal 0.3s ease-out forwards',
        swipeHide: 'swipeHide 0.3s ease-out forwards',
      },
      keyframes: {
        swipeReveal: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100px)' }, // Adjust value as needed
        },
        swipeHide: {
          '0%': { transform: 'translateX(-100px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      transitionProperty: {
        'transform-opacity': 'transform, opacity',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.translate-reveal': {
          transform: 'translateX(-100px)',
        },
        '.opacity-70': {
          opacity: '0.7',
        },
        '.translate-hide': {
          transform: 'translateX(0)',
        },
      }, ['responsive', 'hover']);
    },
  ],
  darkMode: 'class',
};
