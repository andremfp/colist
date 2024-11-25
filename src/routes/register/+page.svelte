<script lang="ts">
	import { register } from '../../lib/auth';
	import { goto } from '$app/navigation';
	import { showToast } from '$lib/utils';

	let email = '';
	let username = '';
	let password = '';
	let confirmPassword = '';

	async function handleRegister() {
		if (password !== confirmPassword) {
			showToast('Passwords do not match');
			return;
		}

		try {
			await register(email, username, password);
			goto('/');
		} catch (error) {
			console.error('Registration error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Registration failed';
			showToast(errorMessage);
		}
	}

	function goBack() {
		goto('/');
	}
</script>

<div
	class="flex items-center justify-center bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark"
>
	<div class="w-full max-w-md flex flex-col items-center">
		<div class="w-full flex justify-start mb-6">
			<button on:click={goBack} class="text-lg font-bold">
				<span class="ri-arrow-left-line text-icon-large"></span>
			</button>
		</div>

		<div class="w-full bg-login-bg-light dark:bg-login-bg-dark shadow-ios rounded-lg p-6">
			<h1 class="text-2xl font-bold mb-4 text-center">Register</h1>
			<form on:submit|preventDefault={handleRegister} class="space-y-4">
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
					<label for="username" class="block font-semibold mb-1">Username:</label>
					<input
						id="username"
						type="text"
						bind:value={username}
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
				<div>
					<label for="confirmPassword" class="block font-semibold mb-1">Confirm Password:</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						class="w-full p-2 border border-border-light dark:border-border-dark rounded-md text-text-light dark:text-input-text-dark bg-white dark:bg-input-bg-dark focus:outline-none focus:ring-1"
						required
					/>
				</div>
				<button
					type="submit"
					class="w-full py-2 bg-login-btn text-text-light rounded-md focus:outline-none focus:bg-login-btn-focus"
				>
					Register
				</button>
			</form>
		</div>
	</div>
</div>
