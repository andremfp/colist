<script lang="ts">
    import { onMount } from 'svelte';
    import { getListItems, getListDetail } from '../../../lib/api';
    import type { ListData, ListItemData } from '../../../lib/types';
    import { page } from '$app/stores';
    import { darkMode } from '$lib/stores/darkModeStore';
    import { goto } from '$app/navigation';

    let listItems: ListItemData[] = [];
    let listDetail: ListData = { id: 0, name: '', owner: 0, shared_with: [], item_count: 0, items: [] };
    let listId: number;

    // Extract list ID from URL
    $: listId = parseInt($page.params.id, 10);

    onMount(async () => {
        try {
            listItems = await getListItems(listId);
            listDetail = await getListDetail(listId);
            console.log(listItems);
            console.log(listDetail);
        } catch (error) {
            console.error('Failed to fetch list details:', error);
        }
    });

    function goBack() {
        goto('/lists');
    }
</script>

<div class={$darkMode ? 'p-4 bg-main-bg-dark text-text-dark' : 'p-4 bg-main-bg-light text-text-light'}>
    <div class="flex items-center mb-6">
        <button on:click={goBack} class="flex items-center text-lg font-bold">
            <span class="ri-arrow-left-s-line text-2xl mr-2"></span>
            My Lists
        </button>
    </div>
    <h1 class="text-3xl font-bold mb-6">{listDetail.name}</h1>

    {#if listItems && listItems.length > 0}
    <div class={`rounded-xl shadow-ios p-4 ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'}`}>
        <ul>
            {#each listItems as item, index (item.id)}
                <li class="flex items-center p-4">
                    <input type="checkbox" class="mr-4" />
                    <span class="flex-grow">{item.name}</span>
                </li>
                {#if listItems.length - 1 !== index}
                    <li class={`border-t ${$darkMode ? 'border-border-dark' : 'border-border-light'}`}></li>
                {/if}
            {/each}
        </ul>
    </div>
    {:else}
        <p class="text-lg">No items available.</p>
    {/if}

    <button class="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-6 shadow-lg hover:bg-blue-600" on:click={() => {/* Add item functionality here */}}>
        <span class="text-2xl">➕</span>
    </button>
</div>

<style>
    .ri-arrow-left-s-line {
        font-size: 1.5rem;
    }
</style>
