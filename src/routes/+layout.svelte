<script>
	import { onMount } from 'svelte';
	import { darkMode } from '$lib/stores/darkModeStore';
	import Header from './Header.svelte';
	import '../app.css';
	import PageTransition from '$lib/transition.svelte';

	export let data;

	onMount(() => {
		document.documentElement.classList.toggle('dark', $darkMode);
	});
</script>

<div
	class="bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark min-h-screen flex flex-col"
>
	<Header />

	<main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
		<PageTransition key={data.path} duration={200}>
			<slot />
		</PageTransition>
	</main>

	<footer class="flex justify-center items-center p-3 sm:p-0">
		<p>
			Visit <a href="https://kit.svelte.dev" class="font-bold">kit.svelte.dev</a> to learn SvelteKit
		</p>
	</footer>
</div>
