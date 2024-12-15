import { writable } from 'svelte/store';
import { auth, db } from './firebase';
import {
	signInWithEmailAndPassword,
	signOut,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	type User,
	type AuthError,
	type UserCredential
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserData } from './types';

const TOKEN_KEY = 'auth_token';

export const isAuthenticated = writable(false); // Reactive store for auth status

// Centralized error handling for authentication

export async function login(email: string, password: string) {
	try {
		const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		// Get ID token
		const token = await user.getIdToken();

		// Store token in local storage
		localStorage.setItem(TOKEN_KEY, token);

		isAuthenticated.set(true);

		return {
			access: token,
			id: user.uid
		};
	} catch (error) {
		console.error('Login error:', error);
		throw handleAuthError(error);
	}
}

export async function logout() {
	try {
		await signOut(auth);

		// Clear stored token and user data
		clearAuthStorage();

		isAuthenticated.set(false);
	} catch (error) {
		console.error('Logout error:', error);
		throw new Error('Logout failed. Please try again.');
	}
}

export async function register(email: string, username: string, password: string) {
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		const userData: UserData = {
			id: user.uid,
			email: user.email || '',
			name: username,
			createdAt: new Date()
		};

		const docRef = doc(db, 'users', userData.id);
		await setDoc(docRef, userData);

		isAuthenticated.set(true);

		return user;
	} catch (error) {
		console.error('Registration error:', error);
		throw handleAuthError(error);
	}
}

// Verify the token and check its expiration
export async function verifyToken(): Promise<boolean> {
	const user = auth.currentUser;

	if (!user) {
		clearAuthStorage();
		return false;
	}

	try {
		// Refresh the token
		const token = await user.getIdToken(true);

		// Get token result to check expiration
		const tokenResult = await user.getIdTokenResult();
		const expirationTime = new Date(tokenResult.expirationTime).getTime();

		// Check if the token is still valid
		const isValid = expirationTime > Date.now();

		if (!isValid) {
			clearAuthStorage();
			isAuthenticated.set(false);
			return false;
		}

		// Store the refreshed token
		localStorage.setItem(TOKEN_KEY, token);
		return true;
	} catch (error) {
		console.error('Token verification failed:', error);
		clearAuthStorage();

		isAuthenticated.set(false);
		return false;
	}
}

// Real-time Authentication Listener
export function initAuthListener() {
	onAuthStateChanged(auth, async (user) => {
		if (user) {
			const tokenValid = await verifyToken();

			if (tokenValid) {
				isAuthenticated.set(true);
			} else {
				isAuthenticated.set(false);
			}
		} else {
			clearAuthStorage();

			isAuthenticated.set(false);
		}
	});
}

// Clear authentication storage
function clearAuthStorage() {
	localStorage.removeItem(TOKEN_KEY);
}

// Route protection utility
export async function protectRoute() {
	const isValid = await verifyToken();

	if (!isValid) {
		// Redirect to login page
		window.location.href = '/';
		return false;
	}

	return true;
}

function handleAuthError(error: unknown): Error {
	if (error instanceof Error && (error as AuthError).code) {
		const firebaseError = error as AuthError;

		const errorMap: Record<string, string> = {
			// Login Errors
			'auth/user-not-found':
				'No user found with this email. Please check your credentials or register.',
			'auth/invalid-credential': 'Incorrect email / password. Please try again.',
			'auth/invalid-email': 'The email address is not valid. Please enter a valid email.',
			'auth/user-disabled': 'This user account has been disabled. Please contact support.',
			'auth/network-request-failed': 'Network problem. Please check network connection.',

			// Registration Errors
			'auth/email-already-in-use':
				'This email is already in use. Please try logging in or use a different email.',
			'auth/operation-not-allowed': 'Registration is currently disabled. Please try again later.',
			'auth/weak-password': 'Password should be at least 6 characters long.'
		};

		return new Error(errorMap[firebaseError.code] || 'Authentication failed. Please try again.');
	}

	return new Error('An unknown error occurred during authentication.');
}
