<script lang="ts">
	import { onMount } from 'svelte';

	export let addButtonText: string = '';
	export let onAdd: () => void;

	let hasScroll = false;
	let footer: HTMLElement;

	$: isAddItem = addButtonText === 'Add Item';

	function handleClick() {
		if (onAdd) onAdd();
	}

	onMount(() => {
		const checkScroll = () => {
			const content = document.documentElement;
			hasScroll =
				content.scrollHeight > window.innerHeight &&
				window.innerHeight + window.scrollY < content.scrollHeight;
		};

		window.addEventListener('scroll', checkScroll);
		window.addEventListener('resize', checkScroll);
		checkScroll();

		return () => {
			window.removeEventListener('scroll', checkScroll);
			window.removeEventListener('resize', checkScroll);
		};
	});
</script>

<footer
	bind:this={footer}
	class="fixed bottom-0 left-0 right-0 h-footer-height transition-colors duration-200 z-10 flex items-center {hasScroll
		? 'bg-main-bg-light dark:bg-main-bg-dark shadow-lg'
		: 'bg-main-bg-light dark:bg-main-bg-dark'}"
>
	<div class="w-full max-w-4xl mx-auto px-4 flex justify-between items-center">
		{#if addButtonText}
			<button
				class="text-base font-normal flex items-center {addButtonText === 'Add Item'
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
