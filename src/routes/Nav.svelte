<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentListStore } from '$lib/stores/listStore';
	import { logout } from '$lib/auth';

	import 'remixicon/fonts/remixicon.css';

	let scrollPosY = 0;
	let nav: HTMLElement;
	let currentRoute: string;
	let debugLogs: string[] = [];
	let keyboardShowing = false;
	let viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
	let originalBodyHeight = '100%';

	$: currentRoute = $page.url.pathname;

	function log(message: string) {
		console.log(message);
		debugLogs = [...debugLogs, message].slice(-10);
	}

	function goBack() {
		goto('/lists');
	}

	function handleViewportResize() {
		if (typeof window === 'undefined') return;

		const currentViewportHeight = window.innerHeight;

		// Detect potential keyboard appearance
		const isKeyboardLikely = currentViewportHeight < viewportHeight;

		if (isKeyboardLikely) {
			// Adjust body height to prevent scroll
			document.body.style.height = `${currentViewportHeight}px`;
			document.documentElement.style.height = `${currentViewportHeight}px`;
			keyboardShowing = true;
		} else {
			// Restore original body height
			document.body.style.height = originalBodyHeight;
			document.documentElement.style.height = originalBodyHeight;
			keyboardShowing = false;
		}

		// Update viewport height
		viewportHeight = currentViewportHeight;

		log(`Viewport resize detected. Keyboard showing: ${keyboardShowing}`);
	}

	function handleInputFocus(event: FocusEvent) {
		if (typeof window === 'undefined') return;

		// Store original body height first time
		if (originalBodyHeight === '100%') {
			originalBodyHeight = document.body.style.height || '100%';
		}

		// Wait a bit to ensure viewport has adjusted
		setTimeout(handleViewportResize, 100);
	}

	function handleInputBlur() {
		if (typeof window === 'undefined') return;

		// Restore original body height
		document.body.style.height = originalBodyHeight;
		document.documentElement.style.height = originalBodyHeight;
		keyboardShowing = false;
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

	onMount(() => {
		// Add resize listener
		window.addEventListener('resize', handleViewportResize);

		// Add focus and blur listeners to all inputs
		const inputs = document.querySelectorAll('input, textarea');
		inputs.forEach((input) => {
			input.addEventListener('focus', handleInputFocus as EventListener);
			input.addEventListener('blur', handleInputBlur as EventListener);
		});

		return () => {
			// Cleanup listeners
			window.removeEventListener('resize', handleViewportResize);
			inputs.forEach((input) => {
				input.removeEventListener('focus', handleInputFocus as EventListener);
				input.removeEventListener('blur', handleInputBlur as EventListener);
			});
		};
	});
</script>

<svelte:window bind:scrollY={scrollPosY} />

<nav
	bind:this={nav}
	class="fixed left-0 right-0 h-nav-height transition-all duration-0 z-10 flex items-center
    {scrollPosY > 120
		? 'bg-nav-bg-scroll-light/95 dark:bg-nav-bg-scroll-dark/95 shadow-lg backdrop-blur-md'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
	style="padding-top: env(safe-area-inset-top);"
>
	<div class="w-full px-2 flex items-center">
		{#if currentRoute !== '/lists' && currentRoute !== '/' && currentRoute !== '/register'}
			<button on:click={goBack} class="flex-1 flex items-center text-text-m text-button-blue">
				<span class="ri-arrow-left-s-line text-icon-xl"></span> My Lists
			</button>
		{/if}

		{#if scrollPosY > 50}
			<p class="mx-auto text-center font-bold text-lg">{$currentListStore.name}</p>
		{/if}

		{#if currentRoute !== '/' && currentRoute !== '/register'}
			<button on:click={handleLogout} class="flex-1 text-xl cursor-pointer text-right">
				<span class="ri-logout-box-r-line pr-2"></span>
			</button>
		{/if}
	</div>
</nav>
