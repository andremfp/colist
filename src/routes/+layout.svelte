<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Nav from './Nav.svelte';
	import Footer from './Footer.svelte';
	import '../app.css';
	import PageTransition from '$lib/transition.svelte';

	export let data;

	let bottomBar: HTMLElement | null;
	let viewport: VisualViewport | null;

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

	function logDebug(message: string) {
		const debugLogElement = document.getElementById('debug-log');
		if (debugLogElement) {
			const logMessage = document.createElement('div');
			logMessage.textContent = message;
			debugLogElement.appendChild(logMessage);
		}
	}

	onMount(() => {
		bottomBar = document.getElementById('nav');
		viewport = window.visualViewport;
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
		window.visualViewport?.addEventListener('scroll', viewportHandler);
		window.visualViewport?.addEventListener('resize', viewportHandler);

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
			window.visualViewport?.removeEventListener('scroll', viewportHandler);
			window.visualViewport?.removeEventListener('resize', viewportHandler);
		};
	});

	function viewportHandler() {
		const layoutViewport = document.getElementById('layoutViewport');

		if (viewport && layoutViewport) {
			logDebug(`got viewport: ${JSON.stringify(viewport)}`);
			logDebug(`got layoutViewport: ${JSON.stringify(layoutViewport)}`);

			// Since the bar is position: fixed we need to offset it by the visual
			// viewport's offset from the layout viewport origin.
			const offsetLeft = viewport?.offsetLeft;
			logDebug(`offsetLeft: ${offsetLeft}`);
			const offsetTop =
				viewport.height - layoutViewport.getBoundingClientRect().height + viewport.offsetTop;
			logDebug(`offsetTop: ${offsetTop}`);

			// You could also do this by setting style.left and style.top if you
			// use width: 100% instead.
			if (bottomBar) {
				bottomBar.style.transform = `translate(${offsetLeft}px, ${offsetTop}px) scale(${
					1 / viewport.scale
				})`;
				logDebug(`transform: ${bottomBar.style.transform}`);
			}
		}
	}
</script>

<div
	class="bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark min-h-screen flex flex-col"
>
	<Nav />

	<main
		class="position-absolute top-[calc(env(safe-area-inset-top) + var(--nav-height))] left-0 right-0 bottom-0 overflow-y-auto flex-1 flex-col pt-nav-height pb-footer-height w-full mx-auto px-4 box-border"
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

<div
	id="debug-log"
	style="position: fixed; top: 50% ; left: 0; width: 100%; background-color: #fff; padding: 10px; font-size: 12px; overflow-y: auto; max-height: 200px;"
></div>
