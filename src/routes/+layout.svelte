<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '../app.css';
	import PageTransition from '$lib/transition.svelte';

	export let data;

	$: isListsPage = $page.url.pathname === '/lists';
	$: showAddButton = $page.url.pathname.startsWith('/lists');

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

	onMount(() => {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		function handleThemeChange(e: any) {
			const isDark = e.matches;
			document.documentElement.classList.toggle('dark', isDark);

			document
				.querySelector('meta[name="theme-color"]')
				?.setAttribute('content', isDark ? '#0F0F0F' : '#FFFFFF');
		}

		// Initial theme setup
		handleThemeChange(darkModeMediaQuery);

		// Listen for future changes
		darkModeMediaQuery.addEventListener('change', handleThemeChange);

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
		};
	});
</script>

<div
	class="bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark pt-[env(safe-area-inset-top)] min-h-screen flex flex-col"
>
	<Nav />

	<main
		class="flex-1 flex flex-col pt-nav-height pb-footer-height w-full max-w-4xl mx-auto px-4 box-border"
	>
		<PageTransition key={data.path} duration={200}>
			<slot />
		</PageTransition>
	</main>

	<Footer
		addButtonText={isListsPage ? 'Add List' : showAddButton ? 'Add Item' : ''}
		onAdd={handleAdd}
	/>
</div>
