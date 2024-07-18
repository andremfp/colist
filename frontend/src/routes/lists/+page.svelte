<script lang="ts">
    import { onMount } from 'svelte';
    import { getLists, createList } from '../../lib/api';
    import type { ListData } from '../../lib/types';
    import { goto } from '$app/navigation';
    import 'remixicon/fonts/remixicon.css'

    let lists: ListData[] = [];
    let newListName = '';
    let sharedWith: number[] = [];
    let showCreateForm = false;

    onMount(async () => {
        try {
            lists = await getLists();
            console.log(lists);
        } catch (error) {
            console.error('Failed to fetch lists:', error);
        }
    });

    async function handleCreateList() {
        try {
            const newList = await createList({ name: newListName, shared_with: sharedWith });
            lists = [...lists, newList];
            goto(`/lists/${newList.id}`);
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    }

    function toggleCreateForm() {
        showCreateForm = !showCreateForm;
    }
</script>

<div class="p-4">
    <h1 class="text-2xl font-bold mb-4">My Lists</h1>
    {#if lists && lists.length > 0}
        <ul class="space-y-2">
            {#each lists as list (list.id)}
                <li class="flex justify-between items-center p-2 border border-gray-300 rounded-md">
                    <a href={`/lists/${list.id}`} class="flex items-center space-x-4">
                        <span class="ri-list-check"></span>
                        <strong>{list.name}</strong>
                    </a>
                    <div class="flex items-center space-x-2">
                        <span class="text-gray-600">{list.item_count}</span>
                        <span class="ri-arrow-right-s-line"></span>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No lists available.</p>
    {/if}

    <!-- Create list form, shown based on showCreateForm variable -->
    {#if showCreateForm}
        <div class="mt-4 p-4 border border-gray-300 rounded-md">
            <h2 class="text-xl font-semibold mb-2">Create a New List</h2>
            <form on:submit|preventDefault={handleCreateList} class="space-y-2">
                <label class="block">
                    List Name:
                    <input type="text" bind:value={newListName} required class="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                </label>
                <!-- Add fields for sharedWith if necessary -->
                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Create List</button>
            </form>
        </div>
    {/if}

    <!-- Floating action button -->
    <button class="fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-4 shadow-lg" on:click={toggleCreateForm}>
        ➕
    </button>
</div>
