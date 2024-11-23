/** @type {import('tailwindcss').Config} */
export default {
	mode: 'jit',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				body: ['Roboto Flex', 'Roboto', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
				mono: ['Roboto Flex', 'Roboto', 'Open Sans', 'Helvetica Neue', 'monospace']
			},
			colors: {
				'main-bg-light': '#F0F0F0',
				'main-bg-dark': '#1F1F1F',
				'text-light': '#1C1C1E',
				'text-dark': '#E0E0E0',
				'login-btn': '#FFB653',
				'login-btn-focus': '#c48429',
				'border-light': '#D3D3D3',
				'border-dark': '#4D4D4D',
				'login-bg-light': '#FFFFFF',
				'login-bg-dark': '#2A2A2A',
				'lists-bg-light': '#FFFFFF',
				'lists-bg-dark': '#2A2A2A',
				'add-item': '#FFB653',
				'bg-add-item': '#FFB653',
				'border-add-item': '#FFB653',
				'list-item-count-light': '#4B5563',
				'list-item-count-dark': '#9CA3AF',
				'input-border-light': '#D1D5DB',
				'input-border-dark': '#4B5563',
				'input-bg-dark': '#374151',
				'input-text-dark': '#D1D5DB',
				'button-blue': '#3B82F6',
				'button-disabled': '#D1D5DB',
				'fail-toast-bg-light': 'rgba(255, 99, 71, 0.2)',
				'fail-toast-bg-dark': 'rgba(220, 20, 60, 0.2)',
				'fail-toast-text': '#FF6B6B',
				'list-shared-dark': '#9CA3AF',
				'list-shared-light': '#4B5563',
				'delete-btn': '#C53030',
				'nav-bg-light': '#F0F0F0',
				'nav-bg-dark': '#1F1F1F',
				'nav-bg-scroll-light': '#E6E6E6',
				'nav-bg-scroll-dark': '#262626',
				'footer-bg-light': '#F0F0F0',
				'footer-bg-dark': '#1F1F1F',
				'footer-bg-scroll-light': '#E6E6E6',
				'footer-bg-scroll-dark': '#262626'
			},
			boxShadow: {
				ios: '0 2px 4px rgba(0, 0, 0, 0.1)'
			},
			spacing: {
				'column-width': '42rem',
				'column-margin-top': '4rem',
				divider: '1px',
				'nav-height': '4rem',
				'footer-height': '4rem'
			},
			fontSize: {
				'icon-xl': '1.5rem',
				'icon-lg': '1.25rem'
			},
			transitionProperty: {
				'transform-opacity': 'transform, opacity'
			}
		}
	},
	plugins: [],
	darkMode: 'class'
};
