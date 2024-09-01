import { auth } from './lib/firebase';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const user = auth.currentUser;

	if (!user && event.url.pathname !== '/') {
		throw redirect(302, '/');
	}

	return resolve(event);
};
