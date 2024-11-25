<script lang="ts">
	import { onMount } from 'svelte';
	import { darkMode } from '$lib/stores/darkModeStore';
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
		document.documentElement.classList.toggle('dark', $darkMode);

		// Apply the dark mode class immediately to avoid flicker
		if ($darkMode) {
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1F1F1F');
			document.querySelector('meta[name="background-color"]')?.setAttribute('content', '#1F1F1F');
		} else {
			document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F0F0F0');
			document.querySelector('meta[name="background-color"]')?.setAttribute('content', '#F0F0F0');
		}

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
	});
</script>

<div
	class="bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark min-h-screen flex flex-col"
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
