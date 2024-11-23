<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { darkMode } from '$lib/stores/darkModeStore';
	import { logout } from '$lib/auth';
	import 'remixicon/fonts/remixicon.css';

	let hasScroll = false;
	let nav: HTMLElement;
	let currentRoute: string;

	$: currentRoute = $page.url.pathname;
	$: darkModeClass = $darkMode ? 'ri-moon-line' : 'ri-sun-line';

	onMount(() => {
		const checkScroll = () => {
			hasScroll = window.scrollY > 0;
		};

		window.addEventListener('scroll', checkScroll);
		checkScroll();

		// Ensure dark mode class is correctly set immediately
		document.documentElement.classList.toggle('dark', $darkMode);

		return () => window.removeEventListener('scroll', checkScroll);
	});

	function goBack() {
		goto('/lists');
	}

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
			await logout();
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

<nav
	bind:this={nav}
	class="fixed top-0 left-0 right-0 h-nav-height transition-colors duration-200 z-10 flex items-center {hasScroll
		? 'bg-main-bg-light dark:bg-main-bg-dark shadow-lg'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
>
	<div class="w-full max-w-4xl mx-auto px-4 flex justify-between items-center">
		<div>
			{#if currentRoute !== '/lists' && currentRoute !== '/' && currentRoute !== '/register'}
				<button on:click={goBack} class="flex items-center text-lg font-bold">
					<span class="ri-arrow-left-s-line text-icon-lg mr-2"></span> My Lists
				</button>
			{/if}
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
	</div>
</nav>
