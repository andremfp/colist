/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Roboto Flex', 'Roboto', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['Roboto Flex', 'Roboto', 'Open Sans', 'Helvetica Neue', 'monospace'],
      },
      colors: {
        'bg-0': '#F7F8F9', // Light gray background
        'bg-1': '#FFFFFF', // White
        'bg-2': '#F2F3F5', // Very light gray
        'theme-1': '#007AFF', // iOS blue
        'theme-2': '#0051A2', // Darker blue for hover
        'text': '#1C1C1E', // Dark gray text
        'border': '#E0E0E0', // Light gray border
      },
      boxShadow: {
        'ios': '0 2px 4px rgba(0, 0, 0, 0.1)', // Soft shadow
      },
      spacing: {
        'column-width': '42rem',
        'column-margin-top': '4rem',
      },
    },
  },
  plugins: [],
}
