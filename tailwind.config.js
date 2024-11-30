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
				'main-bg-light': '#FFFFFF',
				'main-bg-dark': '#0F0F0F',
				'text-light': '#1C1C1E',
				'text-dark': '#E0E0E0',
				'login-btn': '#FFB653',
				'login-btn-focus': '#c48429',
				'border-light': '#D3D3D3',
				'border-dark': '#4D4D4D',
				'login-bg-light': '#F0F0F0',
				'login-bg-dark': '#1F1F1F',
				'lists-bg-light': '#F0F0F0',
				'lists-bg-dark': '#1F1F1F',
				'add-item': '#FFB653',
				'bg-add-item': '#FFB653',
				'border-add-item': '#FFB653',
				'list-item-count-light': '#4B5563',
				'list-item-count-dark': '#9CA3AF',
				'input-border-light': '#D1D5DB',
				'input-border-dark': '#4B5563',
				'input-bg-dark': '#374151',
				'input-text-dark': '#D1D5DB',
				'button-blue': '#007AFF',
				'button-disabled': '#D1D5DB',
				'fail-toast-bg-light': 'rgba(255, 99, 71, 0.2)',
				'fail-toast-bg-dark': 'rgba(220, 20, 60, 0.2)',
				'fail-toast-text': '#FF6B6B',
				'list-shared-dark': '#9CA3AF',
				'list-shared-light': '#4B5563',
				'delete-btn': '#C53030',
				'nav-bg-scroll-light': '#E6E6E6',
				'nav-bg-scroll-dark': '#242424',
				'footer-bg-scroll-light': '#E8E8E8',
				'footer-bg-scroll-dark': '#242424'
			},
			boxShadow: {
				ios: '0 2px 4px rgba(0, 0, 0, 0.1)'
			},
			spacing: {
				'column-width': '42rem',
				'column-margin-top': '4rem',
				divider: '1px',
				'nav-height': '82px',
				'footer-height': '82px'
			},
			fontSize: {
				'text-xl': '1.75rem',
				'text-lg': '1.5rem',
				'text-m': '1.1rem',
				'icon-xl': '1.75rem',
				'icon-lg': '1.5rem',
				'icon-m': '1.25rem'
			},
			transitionProperty: {
				'transform-opacity': 'transform, opacity'
			}
		}
	},
	plugins: [
		function ({ addUtilities }) {
			const newUtilities = {
				'.overscroll-none': {
					'overscroll-behavior-y': 'none',
					'overscroll-behavior-x': 'none'
				}
			};
			addUtilities(newUtilities);
		}
	],
	darkMode: 'class'
};
