<script>
	import Header from './Header.svelte';
	import '../app.css';
  </script>
  
  <div class="flex flex-col min-h-screen">
	<Header />
  
	<main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
	  <slot />
	</main>
  
	<footer class="flex flex-col justify-center items-center p-3 sm:p-0">
	  <p>Visit <a href="https://kit.svelte.dev" class="font-bold">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer>
  </div>