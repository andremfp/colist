<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let addButtonText: string = '';
	export let onAdd: () => void;

	let footer: HTMLElement;
	let hasContentBehind = false;
	let mounted = false;
	let scrollPosY = 0;
	$: currentRoute = $page.url.pathname;

	function handleClick(event: MouseEvent) {
		if (onAdd) onAdd();
	}

	function checkContentBehind() {
		if (!mounted || typeof window === 'undefined') return false;

		const bodyHeight = document.body.scrollHeight;
		const windowHeight = window.innerHeight;

		// Check if content extends beyond viewport or if we've scrolled
		hasContentBehind = bodyHeight > windowHeight && scrollPosY * 4.1 < bodyHeight - 82;
	}

	onMount(() => {
		mounted = true;
		checkContentBehind();

		// Set up event listeners
		window.addEventListener('scroll', checkContentBehind);
		window.addEventListener('resize', checkContentBehind);

		// Check for DOM changes that might affect content height
		const observer = new MutationObserver(checkContentBehind);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true
		});

		return () => {
			mounted = false;
			window.removeEventListener('scroll', checkContentBehind);
			window.removeEventListener('resize', checkContentBehind);
			observer.disconnect();
		};
	});
</script>

<svelte:window bind:scrollY={scrollPosY} />

<footer
	bind:this={footer}
	class="fixed bottom-0 left-0 right-0 h-footer-height transition-all duration-200 z-10 flex items-center {hasContentBehind &&
	currentRoute !== '/' &&
	currentRoute !== '/register'
		? 'bg-footer-bg-scroll-light/95 dark:bg-footer-bg-scroll-dark/95 shadow-lg backdrop-blur-md'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
	style="padding-bottom: env(safe-area-inset-bottom);"
>
	<div class="w-full px-2 flex items-center justify-between">
		{#if addButtonText}
			<button
				class="footer-add-btn flex-1 flex items-center text-text-m {addButtonText === 'Add Item'
					? 'text-add-item'
					: 'text-button-blue'}"
				on:click={handleClick}
			>
				<span class="ri-add-line text-icon-lg"></span>
				{addButtonText}
			</button>
		{:else}
			<div class="flex-1"></div>
		{/if}

		<a
			href="https://github.com/andremfp/colist"
			target="_blank"
			rel="noopener noreferrer"
			class="absolute right-4"
		>
			<span class="ri-github-fill text-icon-lg"></span>
		</a>
	</div>
</footer>
