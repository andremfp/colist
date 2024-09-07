<script>
    import Header from './Header.svelte';
    import { darkMode } from '$lib/stores/darkModeStore';
    import '../app.css';
</script>

<div class={$darkMode ? 'bg-main-bg-dark text-text-dark min-h-screen flex flex-col' : 'bg-main-bg-light text-text min-h-screen flex flex-col'}>
    <Header />

    <main class="flex-1 flex flex-col p-4 w-full max-w-4xl mx-auto box-border">
        <slot />
    </main>

    <footer class="flex justify-center items-center p-3 sm:p-0">
        <p>Visit <a href="https://kit.svelte.dev" class="font-bold">kit.svelte.dev</a> to learn SvelteKit</p>
    </footer>
</div>
