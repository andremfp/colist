<script lang="ts">
	import { onMount } from 'svelte';

	export let addButtonText: string = '';
	export let onAdd: () => void;

	let footer: HTMLElement;
	let hasContentBehind = false;
	let mounted = false;
	let scrollPosY = 0;

	function handleClick(event: MouseEvent) {
		if (onAdd) onAdd();
	}

	function checkContentBehind() {
		if (!mounted || typeof window === 'undefined') return false;

		const bodyHeight = document.body.scrollHeight;
		const windowHeight = window.innerHeight;

		// Check if content extends beyond viewport or if we've scrolled
		hasContentBehind = bodyHeight > windowHeight && scrollPosY * 5.9 < bodyHeight - 65;
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
	class="fixed bottom-0 left-0 right-0 h-footer-height transition-all duration-200 z-10 flex items-center {hasContentBehind
		? 'bg-footer-bg-scroll-light/95 dark:bg-footer-bg-scroll-dark/95 shadow-lg backdrop-blur-md'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
	style="padding-bottom: env(safe-area-inset-bottom);"
>
	<div class="w-full max-w-4xl mx-auto px-4 flex justify-between items-center">
		{#if addButtonText}
			<button
				class="footer-add-btn text-base font-normal flex items-center {addButtonText === 'Add Item'
					? 'text-add-item'
					: 'text-button-blue'}"
				on:click={handleClick}
			>
				<span class="ri-add-line text-icon-lg mr-2"></span>
				{addButtonText}
			</button>
		{:else}
			<div></div>
		{/if}

		<a
			href="https://github.com/yourusername/yourrepo"
			target="_blank"
			rel="noopener noreferrer"
			class="text-text-light dark:text-text-dark hover:opacity-80"
		>
			<span class="ri-github-fill text-icon-lg"></span>
		</a>
	</div>
</footer>

<style>
	@media (max-height: 450px) {
		/* Hide footer when virtual keyboard is likely visible */
		footer {
			display: none;
		}
	}
</style>
