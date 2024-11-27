<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { currentListStore } from '$lib/stores/listStore';
	import { logout } from '$lib/auth';

	import 'remixicon/fonts/remixicon.css';

	let scrollPosY = 0;
	let nav: HTMLElement;
	let currentRoute: string;

	$: currentRoute = $page.url.pathname;

	onMount(() => {});

	function goBack() {
		goto('/lists');
	}

	async function handleLogout() {
		try {
			await logout();
		} catch (error) {
			console.error('Error during logout:', error);
			alert('Logout failed. You have been logged out locally.');
		} finally {
			localStorage.removeItem('access_token');
			localStorage.removeItem('refresh_token');
			window.location.href = '/';
		}
	}
</script>

<svelte:window bind:scrollY={scrollPosY} />

<nav
	bind:this={nav}
	class="fixed top-0 left-0 right-0 h-nav-height transition-all duration-500 z-10 flex items-center
    bg-[#FF272E] dark:bg-[#FF272E]
    {scrollPosY > 120
		? 'bg-nav-bg-scroll-light/95 dark:bg-nav-bg-scroll-dark/95 shadow-lg backdrop-blur-md'
		: 'bg-main-bg-light dark:bg-main-bg-dark'} 
    h-[calc(env(safe-area-inset-top)+56px)]
    pt-[env(safe-area-inset-top)]"
>
	<div class="w-full px-2 flex justify-between items-center">
		{#if currentRoute !== '/lists' && currentRoute !== '/' && currentRoute !== '/register'}
			<button on:click={goBack} class="flex items-center text-medium text-button-blue">
				<span class="ri-arrow-left-s-line text-icon-xl"></span> My Lists
			</button>
		{/if}

		{#if scrollPosY > 50}
			<p class="ml-auto font-bold text-lg">{$currentListStore.name}</p>
		{/if}

		{#if currentRoute !== '/' && currentRoute !== '/register'}
			<button on:click={handleLogout} class="text-xl cursor-pointer ml-auto">
				<span class="ri-logout-box-r-line pr-2"></span>
			</button>
		{/if}
	</div>
</nav>
