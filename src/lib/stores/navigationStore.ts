// src/lib/stores/navigationStore.ts
import { writable } from 'svelte/store';

export const navigationDirection = writable('forward');

export function updateNavigationDirection(fromPath: string, toPath: string) {
	switch (true) {
		case fromPath === '/' && toPath === '/register':
		case fromPath === '/' && toPath === '/lists':
		case fromPath === '/lists' && toPath.startsWith('/lists/'):
			navigationDirection.set('forward');
			break;
		case fromPath === '/register' && toPath === '/':
		case fromPath.startsWith('/lists/') && toPath === '/lists':
			navigationDirection.set('backward');
			break;
		default:
			break;
	}
}
