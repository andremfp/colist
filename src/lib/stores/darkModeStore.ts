import { doc } from '@firebase/firestore';
import { writable } from 'svelte/store';

// Create a writable store for dark mode
export const darkMode = writable(false);

// Initialize dark mode from localStorage
if (typeof window !== 'undefined') {
	const isDarkMode = localStorage.getItem('darkMode') === 'true';
	darkMode.set(isDarkMode);

	// Apply the dark mode class immediately to avoid flicker
	if (isDarkMode) {
		document.documentElement.classList.add('dark');
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1F1F1F');
	} else {
		document.documentElement.classList.remove('dark');
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F0F0F0');
	}
}
