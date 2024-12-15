import { auth, db } from './firebase';
import { writable } from 'svelte/store';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import type { AuthError } from 'firebase/auth';
import type { UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { UserData } from './types';
import { goto } from '$app/navigation';
import { onAuthStateChanged } from 'firebase/auth';

// Create a store to hold the authentication state
export const isAuthenticated = writable(false);

// Array of protected routes
const protectedRoutes = ['/lists', '/profile'];

export async function login(email: string, password: string) {
	try {
		const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		const token = await user.getIdToken();

		return {
			access: token,
			id: user.uid
		};
	} catch (error) {
		console.error('Login error:', error);

		if (error instanceof Error && (error as AuthError).code) {
			const firebaseError = error as AuthError;

			// Check for specific Firebase Auth errors
			switch (firebaseError.code) {
				case 'auth/user-not-found':
					throw new Error(
						'No user found with this email. Please check your credentials or register.'
					);
				case 'auth/invalid-credential':
					throw new Error('Incorrect email / password. Please try again.');
				case 'auth/invalid-email':
					throw new Error('The email address is not valid. Please enter a valid email.');
				case 'auth/user-disabled':
					throw new Error('This user account has been disabled. Please contact support.');
				case 'auth/network-request-failed':
					throw new Error('Network problem. Please check network connection.');
				default:
					throw new Error('Login failed. Please try again.');
			}
		} else {
			throw new Error('An unknown error occurred during login.');
		}
	}
}

export async function logout() {
	await signOut(auth);
}

export async function register(email: string, username: string, password: string) {
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;

		const userData: UserData = {
			id: userCredential.user.uid,
			email: userCredential.user.email || '',
			name: username,
			createdAt: new Date()
		};

		const docRef = doc(db, 'users', userData.id);

		// Set the document with the custom ID
		await setDoc(docRef, userData);

		return user;
	} catch (error) {
		console.error('Registration error:', error);

		if (error instanceof Error && (error as AuthError).code) {
			const firebaseError = error as AuthError;

			// Check for specific Firebase Auth errors
			switch (firebaseError.code) {
				case 'auth/email-already-in-use':
					throw new Error(
						'This email is already in use. Please try logging in or use a different email.'
					);
				case 'auth/invalid-email':
					throw new Error('The email address is not valid. Please enter a valid email.');
				case 'auth/operation-not-allowed':
					throw new Error('Registration is currently disabled. Please try again later.');
				case 'auth/weak-password':
					throw new Error('Password should be at least 6 characters long.');
				default:
					throw new Error('Registration failed. Please try again.');
			}
		} else {
			throw new Error('An unknown error occurred during registration.');
		}
	}
}

// Listen for authentication state changes
export function listenForAuthChanges() {
	onAuthStateChanged(auth, (user) => {
		if (user) {
			isAuthenticated.set(true);
		} else {
			isAuthenticated.set(false);

			// Get the current page route (adjust based on your setup)
			const currentPath = window.location.pathname;

			// Check if the current route is protected
			if (protectedRoutes.includes(currentPath)) {
				goto('/'); // Redirect to login page if not authenticated
			}
		}
	});
}
