<!-- src/Nav.svelte

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { getListDetails } from '../lib/api';
	import { breadcrumbs } from '../store/breadcrumbs';

	let originalPaths: string[] = [];
	let translatedPaths: string[] = [];
	
	const parts = $page.url.pathname.split('/').filter(Boolean);

	// build originalPaths
	let currentPath = '';
	//let currentTranslatedPath = '';
	let previousPart = '';
	for (let part of parts) {
		// translate ids to names for breadcrumbs
		if (previousPart === 'lists') {
			const listId = parseInt(part);
			const list = await getListDetails(listId);
			currentPath += `/${part}`;
			originalPaths.push(currentPath);
			translatedPaths.push(`${list.name}`);
			continue;
		}

		currentPath += `/${part}`;
		originalPaths.push(currentPath);
		translatedPaths.push(part);
		
		previousPart = part;
	}

	breadcrumbs.set({ originalPaths, translatedPaths });
	console.log(originalPaths);
	console.log(translatedPaths);

	// onMount(async () => {
        
    // });

</script>

<nav>
	<a href="/" class={$page.url.pathname === '/' ? 'active' : ''}>Home</a>
	{#each $breadcrumbs.translatedPaths as crumb, i}
        <a href={$breadcrumbs.originalPaths[i]} class={$page.url.pathname === $breadcrumbs.originalPaths[i] ? 'active' : ''}>{crumb}</a>
    {/each}
</nav>

<style>
	nav {
		background-color: #333;
		color: white;
		padding: 1rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
	}

	a {
		color: white;
		text-decoration: none;
		margin-right: 0.5rem;
	}

	a.active {
		text-decoration: underline;
	}

	a:hover {
		text-decoration: underline;
	}
</style> -->
