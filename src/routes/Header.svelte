<script>
	import { onMount } from 'svelte';
	import { darkMode } from '$lib/stores/darkModeStore';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import { logout } from '$lib/auth';
	import { page } from '$app/stores';
	import 'remixicon/fonts/remixicon.css';

	let currentRoute;
	$: currentRoute = $page.url.pathname;
	$: darkModeClass = $darkMode ? 'ri-moon-line' : 'ri-sun-line';

	onMount(() => {
		// Ensure dark mode class is correctly set immediately
		document.documentElement.classList.toggle('dark', $darkMode);
	});

	function toggleDarkMode() {
		darkMode.update((value) => {
			const newMode = !value;
			localStorage.setItem('darkMode', newMode.toString());
			document.documentElement.classList.toggle('dark', newMode);
			return newMode;
		});
	}

	async function handleLogout() {
		try {
			// await logout();
		} catch (error) {
			console.error('Error during logout:', error);
			alert('Logout failed. You have been logged out locally.');
		} finally {
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			window.location.href = '/';
		}
	}
</script>

<header
	class="flex justify-between items-center p-4 bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark"
>
	<div class="w-12 h-12 flex items-center justify-center">
		<a href="https://kit.svelte.dev">
			<img src={logo} alt="SvelteKit" class="w-8 h-8 object-contain" />
		</a>
	</div>

	<div class="w-12 h-12 flex items-center justify-center">
		<a href="https://github.com/sveltejs/kit">
			<img src={github} alt="GitHub" class="w-8 h-8 object-contain" />
		</a>
	</div>

	<div class="flex items-center space-x-4">
		<button on:click={toggleDarkMode} class="text-xl cursor-pointer">
			<span class={darkModeClass}></span>
		</button>

		{#if currentRoute !== '/' && currentRoute !== '/register'}
			<button on:click={handleLogout} class="text-xl cursor-pointer">
				<span class="ri-logout-box-r-line"></span>
			</button>
		{/if}
	</div>
</header>
