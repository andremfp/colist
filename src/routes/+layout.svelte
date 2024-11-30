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
			document
				.querySelector('meta[name="background"]')
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

		// Prevent body scrolling when an input is focused
		const handleFocus = () => {
			document.body.classList.add('fixed', 'inset-0', 'overflow-hidden');
		};

		const handleBlur = () => {
			document.body.classList.remove('fixed', 'inset-0', 'overflow-hidden');
		};

		// Add event listeners to all inputs
		const inputs = document.querySelectorAll('input, textarea, select');
		inputs.forEach((input) => {
			input.addEventListener('focus', handleFocus);
			input.addEventListener('blur', handleBlur);
		});

		return () => {
			darkModeMediaQuery.removeEventListener('change', handleThemeChange);
			inputs.forEach((input) => {
				input.removeEventListener('focus', handleFocus);
				input.removeEventListener('blur', handleBlur);
			});
		};
	});
</script>

<div
	class="bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark min-h-screen flex flex-col overflow-hidden"
>
	<Nav />

	<main
		class="flex-1 flex-col overflow-y-auto pt-nav-height pb-footer-height w-full mx-auto px-4 box-border relative"
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
