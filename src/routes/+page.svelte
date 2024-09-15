<script lang="ts">
	import { login } from '../lib/auth';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let errorMessage = '';

	async function handleLogin() {
		try {
			await login(email, password);
			goto('/lists');
		} catch (error) {
			console.error('Login error:', error);
			errorMessage = error instanceof Error ? error.message : 'Login failed';
			showToast(errorMessage);
		}
	}

	function showToast(message: string) {
		const toast = document.createElement('div');
		toast.textContent = message;
		toast.className = `bg-fail-toast-bg-light dark:bg-fail-toast-bg-dark text-fail-toast-text fixed top-4 left-1/2 transform -translate-x-1/2 py-2 px-6 rounded-md shadow-lg backdrop-blur-md`;
		document.body.appendChild(toast);
		setTimeout(() => toast.remove(), 5000);
	}
</script>

<!-- Centering container -->
<div
	class="flex items-center justify-center bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark"
>
	<!-- Login form container -->
	<div class="w-full max-w-md bg-login-bg-light dark:bg-login-bg-dark shadow-ios rounded-lg p-6">
		<h1 class="text-2xl font-bold mb-4 text-center text-text-light dark:text-text-dark">Login</h1>

		<!-- Login form -->
		<form on:submit|preventDefault={handleLogin} class="space-y-4">
			<div>
				<label class="block font-semibold mb-1" for="email">Email:</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="w-full p-2 border border-border-light dark:border-border-dark rounded-md text-text-light dark:text-input-text-dark bg-white dark:bg-input-bg-dark focus:outline-none focus:ring-1"
					required
				/>
			</div>

			<div>
				<label class="block font-semibold mb-1" for="password">Password:</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="w-full p-2 border border-border-light dark:border-border-dark rounded-md text-text-light dark:text-input-text-dark bg-white dark:bg-input-bg-dark focus:outline-none focus:ring-1"
					required
				/>
			</div>

			<button
				type="submit"
				class="w-full py-2 bg-login-btn text-white rounded-md focus:outline-none focus:bg-login-btn-focus"
			>
				Login
			</button>
		</form>
		<p class="mt-4 text-center">
			<a href="/register" class="text-text-light dark:text-text-dark underline">Register</a>
		</p>
	</div>
</div>
