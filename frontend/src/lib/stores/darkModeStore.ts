import { writable } from 'svelte/store';

// Create a writable store for dark mode
export const darkMode = writable(false);

// Initialize dark mode from localStorage
if (typeof window !== 'undefined') {
  darkMode.set(localStorage.getItem('dark-mode') === 'true');
}
