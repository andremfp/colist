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
	let navTranslateY = 0;
	let debugLogs: string[] = [];
	let keyboardHeight = 0;

	$: currentRoute = $page.url.pathname;

	function goBack() {
		goto('/lists');
	}

	function log(message: string) {
		console.log(message);
		debugLogs = [...debugLogs, message].slice(-10); // Keep last 5 logs
	}

	function handleVisualViewportResize() {
		if (!window.visualViewport) {
			console.log('Visual Viewport API not supported');
			return;
		}

		// Calculate keyboard height
		keyboardHeight = window.outerHeight - window.visualViewport.height;
		console.log('Outer Height:', window.outerHeight);
		console.log('Visual Viewport Height:', window.visualViewport.height);
		console.log('Keyboard Height:', keyboardHeight);

		// Prevent the page from being resized
		if (keyboardHeight > 0) {
			console.log('body height before:', document.body.style.height);
			console.log('body overflow before:', document.body.style.overflow);
			document.body.style.height = `${window.visualViewport.height}px`;
			document.body.style.overflow = 'hidden';
			console.log('body height after:', document.body.style.height);
			console.log('body overflow after:', document.body.style.overflow);
		} else {
			document.body.style.height = '';
			document.body.style.overflow = '';
		}
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
		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', handleVisualViewportResize);
		}

		return () => {
			// Cleanup
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
			}
			document.body.style.height = '';
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window bind:scrollY={scrollPosY} />

<nav
	bind:this={nav}
	class="fixed top-0 left-0 right-0 h-nav-height transition-all duration-500 z-10 flex items-center
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

<!-- Debug Logs -->
<div
	class="fixed top-1/3 left-0 right-0 bg-main-bg-light dark:bg-main-bg-dark z-50 p-2"
	style="margin-top: env(safe-area-inset-top)"
>
	<h3 class="font-bold">Debug Logs:</h3>
	{#each debugLogs as log}
		<p class="text-xs">{log}</p>
	{/each}
</div>
