<script lang="ts">
	import { onMount } from 'svelte';
	import { darkMode } from '$lib/stores/darkModeStore';
	import Header from './Header.svelte';
	import '../app.css';
	import PageTransition from '$lib/transition.svelte';
	import github_light from '$lib/images/github_light.svg';
	import github_dark from '$lib/images/github_dark.svg';

	export let data;

	$: githubIcon = $darkMode ? github_dark : github_light;

	onMount(() => {
		document.documentElement.classList.toggle('dark', $darkMode);

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
	<Header />

	<main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
		<PageTransition key={data.path} duration={200}>
			<slot />
		</PageTransition>
	</main>

	<footer class="flex justify-center items-center p-3 sm:p-0">
		<div class="w-12 h-12 flex items-center justify-center">
			<a href="https://github.com/andremfp/colist">
				<img src={githubIcon} alt="GitHub" class="w-8 h-8 object-contain" />
			</a>
		</div>
	</footer>
</div>
