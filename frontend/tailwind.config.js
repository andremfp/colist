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
      },
      boxShadow: {
        'ios': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        'column-width': '42rem',
        'column-margin-top': '4rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enables dark mode based on a class
}
