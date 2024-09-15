import { fetchUserById } from './api';
import type { ListItem } from './types';

// Utility function to show toast messages

export function showToast(message: string) {
	const toast = document.createElement('div');
	toast.textContent = message;
	toast.className = `bg-fail-toast-bg-light dark:bg-fail-toast-bg-dark text-fail-toast-text fixed top-4 left-1/2 transform -translate-x-1/2 py-2 px-6 rounded-md shadow-lg backdrop-blur-md`;
	document.body.appendChild(toast);
	setTimeout(() => toast.remove(), 5000);
}

// Utility function to sort list items by checked status and name
export function sortItems(items: ListItem[]) {
	items.sort((a, b) => {
		if (a.checked !== b.checked) {
			return a.checked ? 1 : -1; // Checked items go to the bottom
		}
		return a.name.localeCompare(b.name); // Sort alphabetically
	});
}

// Utility function to get shared user names based on their IDs
export async function getSharedWithUsers(
	sharedBy: string[],
	currentUserId: string
): Promise<string[]> {
	const usernames: string[] = [];

	for (const userId of sharedBy) {
		if (userId !== currentUserId) {
			try {
				const user = await fetchUserById(userId); // Assuming `fetchUserById` is a function you already have
				if (user && user.name) {
					usernames.push(user.name);
				}
			} catch (error) {
				console.error(`Failed to fetch user by ID (${userId}):`, error);
			}
		}
	}

	return usernames;
}
