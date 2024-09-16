import { browser } from '$app/environment';
import { updateNavigationDirection } from '$lib/stores/navigationStore';

export function load({ url }) {
	if (browser) {
		const previousPath = sessionStorage.getItem('currentPath') || '/';
		updateNavigationDirection(previousPath, url.pathname);
		sessionStorage.setItem('currentPath', url.pathname);
	}
	return {
		path: url.pathname
	};
}
