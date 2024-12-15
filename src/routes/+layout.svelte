<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '../app.css';
	import PageTransition from '$lib/transition.svelte';

	export let data;

	let isKeyboardVisible = false;

	$: isListsPage = $page.url.pathname === '/lists';
	$: showAddButton = $page.url.pathname.startsWith('/lists');

	function checkKeyboard() {
		logDebug('checking keyboard');
		if (typeof window !== 'undefined' && window.visualViewport) {
			logDebug(`viewport height: ${window.visualViewport.height}`);
			logDebug(`outer height: ${window.outerHeight}`);

			isKeyboardVisible = window.visualViewport.height < window.outerHeight;
		}
	}

	function handleAdd() {
		if (isListsPage) {
			window.dispatchEvent(
				new CustomEvent('showCreateListForm', {
					bubbles: true,
					composed: true
				})
			);
		} else if (showAddButton) {
			window.dispatchEvent(
				new CustomEvent('addNewItemRow', {
					bubbles: true,
					composed: true
				})
			);
		}
	}

	function logDebug(message: string) {
		const debugLogElement = document.getElementById('debug-log');
		if (debugLogElement) {
			const logMessage = document.createElement('div');
			logMessage.textContent = message;
			debugLogElement.appendChild(logMessage);
		}
	}

	onMount(() => {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		function handleThemeChange(e: any) {
			const isDark = e.matches;
			document.documentElement.classList.toggle('dark', isDark);

			document
				.querySelector('meta[name="theme-color"]')
				?.setAttribute('content', isDark ? '#0F0F0F' : '#FFFFFF');
			document
				.querySelector('meta[name="background"]')
				?.setAttribute('content', isDark ? '#0F0F0F' : '#FFFFFF');
		}

		// Initial theme setup
		handleThemeChange(darkModeMediaQuery);

		// Listen for future changes
		darkModeMediaQuery.addEventListener('change', handleThemeChange);

		// Add viewport resize listener

		window.addEventListener('resize', checkKeyboard);

		if ('serviceWorker' in navigator) {
			window.addEventListener('load', () => {
				navigator.serviceWorker
					.register('/service-worker.js')
					.then((registration) => {
						console.log('Service Worker registered with scope:', registration.scope);
					})
					.catch((error) => {
						console.error('Service Worker registration failed:', error);
					});
			});
		}

		return () => {
			darkModeMediaQuery.removeEventListener('change', handleThemeChange);
			window.removeEventListener('resize', checkKeyboard);
		};
	});
</script>

<div
	class="bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark min-h-screen flex flex-col"
>
	{#if !isKeyboardVisible}
		<Nav />
	{/if}

	<main
		class="position-absolute top-[calc(env(safe-area-inset-top) + var(--nav-height))] left-0 right-0 bottom-0 overflow-y-auto flex-1 flex-col pt-nav-height pb-footer-height w-full mx-auto px-4 box-border"
	>
		<PageTransition key={data.path} duration={200}>
			<slot />
		</PageTransition>
	</main>

	{#if !isKeyboardVisible}
		<Footer
			addButtonText={isListsPage ? 'Add List' : showAddButton ? 'Add Item' : ''}
			onAdd={handleAdd}
		/>
	{/if}
</div>

<div
	id="debug-log"
	style="position: fixed; top: 50% ; left: 0; width: 100%; background-color: #fff; padding: 10px; font-size: 12px; overflow-y: auto; max-height: 200px;"
></div>
