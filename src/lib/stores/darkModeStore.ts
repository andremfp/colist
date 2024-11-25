import { writable } from 'svelte/store';

// Create a writable store for dark mode
export const darkMode = writable(false);

if (typeof window !== 'undefined') {
	// Check localStorage first for manual override
	const storedPreference = localStorage.getItem('darkMode');

	if (storedPreference !== null) {
		// Use stored preference if it exists
		darkMode.set(storedPreference === 'true');
	} else {
		// Otherwise use system preference
		const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		darkMode.set(systemPrefersDark);
	}
}

// Subscribe to store changes to update DOM
darkMode.subscribe((isDark) => {
	if (typeof window !== 'undefined') {
		if (isDark) {
			document.documentElement.classList.add('dark');
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1F1F1F');
			document.querySelector('meta[name="background"]')?.setAttribute('content', '#1F1F1F');
		} else {
			document.documentElement.classList.remove('dark');
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F0F0F0');
			document.querySelector('meta[name="background"]')?.setAttribute('content', '#F0F0F0');
		}
	}
});
