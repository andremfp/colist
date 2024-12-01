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

	$: currentRoute = $page.url.pathname;

	function log(message: string) {
		console.log(message);
		debugLogs = [...debugLogs, message].slice(-10); // Keep last 5 logs
	}

	function goBack() {
		goto('/lists');
	}

	function handleVisualViewportResize() {
		if (!window.visualViewport) {
			log('Visual Viewport API not supported');
			return;
		} else {
			keyboardShowing = window.visualViewport.height < window.outerHeight;
			log(`keyboard showing? ${keyboardShowing}`);
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
		// Add event listener for visual viewport
		if (window.visualViewport) {
			log('Adding Visual Viewport Resize Listener');
			window.visualViewport.addEventListener('resize', handleVisualViewportResize);
			window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
		} else {
			log('Visual Viewport API Not Available');
		}

		return () => {
			// Cleanup
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
				window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
			}
		};
	});
</script>

<svelte:window bind:scrollY={scrollPosY} />

<nav
	bind:this={nav}
	class="fixed bottom-0 left-0 right-0 h-nav-height transition-all duration-500 z-10 flex items-center
    {scrollPosY > 120
		? 'bg-nav-bg-scroll-light/95 dark:bg-nav-bg-scroll-dark/95 shadow-lg backdrop-blur-md'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
	style="top: {keyboardShowing ? scrollPosY : 0}px; padding-top: env(safe-area-inset-top);"
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
