<script lang="ts">
	import { login } from '../lib/auth';
	import { goto } from '$app/navigation';
	import { showToast } from '$lib/utils';

	let email = '';
	let password = '';

	async function handleLogin() {
		try {
			await login(email, password);
			goto('/lists');
		} catch (error) {
			console.error('Login error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Login failed';
			showToast(errorMessage);
		}
	}
</script>

<div
	class="flex flex-col justify-center items-center bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark"
>
	<div class="h-28 w-56 mx-auto mt-24">
		<img src="/images/colist.png" class="object-contain" alt="CoList Logo" />
	</div>

	<div class="w-full max-w-md bg-login-bg-light dark:bg-login-bg-dark shadow-ios rounded-lg p-6">
		<h1 class="text-2xl font-bold mb-4 text-center">Login</h1>

		<form on:submit|preventDefault={handleLogin} class="space-y-4">
			<div>
				<label for="email" class="block font-semibold mb-1">Email:</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="w-full p-2 border border-border-light dark:border-border-dark rounded-md text-text-light dark:text-input-text-dark bg-white dark:bg-input-bg-dark focus:outline-none focus:ring-1"
					required
				/>
			</div>

			<div>
				<label for="password" class="block font-semibold mb-1">Password:</label>
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
				class="w-full py-2 bg-login-btn text-text-light rounded-md focus:outline-none focus:bg-login-btn-focus"
			>
				Login
			</button>
		</form>

		<p class="mt-4 text-center">
			<a href="/register" class="text-text-light dark:text-text-dark underline">Register</a>
		</p>
	</div>
</div>

<style>
	.html {
		overscroll-behavior: none;
	}
</style>
