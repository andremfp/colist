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
			log('Visual Viewport API not supported');
			return;
		}

		log(`Window Inner Height: ${window.innerHeight}`);
		log(`Visual Viewport Height: ${window.visualViewport.height}`);
		log(`Window Outer Height: ${window.outerHeight}`);
		log(`Screen Height: ${screen.height}`);

		// Check if a keyboard is likely open
		const isKeyboardVisible = window.innerHeight > window.visualViewport.height;

		log(`Is Keyboard Visible: ${isKeyboardVisible}`);

		if (isKeyboardVisible) {
			// Calculate the difference between window height and visual viewport height
			const keyboardHeight = window.innerHeight - window.visualViewport.height;

			log(`Keyboard Height: ${keyboardHeight}`);

			// Translate the navbar up by the keyboard height
			navTranslateY = -keyboardHeight;
			log(`Navbar Translate Y: ${navTranslateY}`);
		} else {
			// Reset translation when keyboard is not visible
			navTranslateY = 0;
			log('Keyboard not visible, resetting navbar position');
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
		log('Nav Component Mounted');

		// Add event listener for visual viewport
		if (window.visualViewport) {
			log('Adding Visual Viewport Resize Listener');
			window.visualViewport.addEventListener('resize', handleVisualViewportResize);
			window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
		} else {
			log('Visual Viewport API Not Available');
		}

		// Additional event listeners for debugging
		window.addEventListener('resize', () => log('Window Resize Event'));
		document.addEventListener(
			'focus',
			(e) => {
				if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
					log(`Focus on input: ${e.target.tagName}`);
				}
			},
			true
		);

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
	class="fixed top-0 left-0 right-0 h-nav-height transition-all duration-500 z-10 flex items-center
    {scrollPosY > 120
		? 'bg-nav-bg-scroll-light/95 dark:bg-nav-bg-scroll-dark/95 shadow-lg backdrop-blur-md'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
	style="padding-top: env(safe-area-inset-top);
		   transform: translateY({navTranslateY}px);"
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
