<script lang="ts">
    import { onMount } from 'svelte';
    import { getLists, createList } from '../../lib/api';
    import type { ListData } from '../../lib/types';
    import { goto } from '$app/navigation';
    import { darkMode } from '$lib/stores/darkModeStore'; // Import the shared dark mode store

    let lists: ListData[] = [];
    let newListName = '';
    let sharedWith: number[] = [];
    let showCreateForm = false;

    onMount(async () => {
        try {
            lists = await getLists();
            darkMode.subscribe(value => $darkMode = value);
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

<div class={$darkMode ? 'p-4 bg-dark-main-bg-dark text-text-dark' : 'p-4 bg-main-bg-light text-text'}>
    <h1 class="text-3xl font-bold mb-6">My Lists</h1>
    {#if lists && lists.length > 0}
    <ul class="space-y-2">
        {#each lists as list (list.id)}
            <li class={`flex rounded-xl shadow-ios transition-colors duration-200 
                         ${$darkMode ? 'bg-lists-bg-dark hover:bg-lists-hover-dark' : 'bg-lists-bg-light hover:bg-lists-hover-light'}`}
                >
                <button 
                    class="w-full flex items-center justify-between p-4 text-left bg-transparent cursor-default"
                    on:click={() => goto(`/lists/${list.id}`)}
                    aria-label={`View details of ${list.name}`}
                >
                    <div class="flex items-center space-x-4">
                        <span class="ri-list-check text-xl"></span>
                        <div class="flex-grow">
                            <strong class="text-lg font-semibold">{list.name}</strong>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class={`text-sm ${$darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{list.item_count}</span>
                        <span class="ri-arrow-right-s-line text-xl"></span>
                    </div>
                </button>
            </li>
        {/each}
    </ul>
    
    {:else}
        <p class="text-lg">No lists available.</p>
    {/if}

    {#if showCreateForm}
        <div class={`mt-6 p-6 border rounded-xl ${$darkMode ? 'border-border-dark bg-main-bg-dark' : 'border-border-light bg-main-bg-light'}`}>
            <h2 class="text-xl font-semibold mb-4">Create a New List</h2>
            <form on:submit|preventDefault={handleCreateList} class="space-y-4">
                <label class="block">
                    List Name:
                    <input type="text" bind:value={newListName} required 
                           class={`mt-2 block w-full p-3 border rounded-md 
                                  ${$darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300'}`} />
                </label>
                <button type="submit" class="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">Create List</button>
            </form>
        </div>
    {/if}

    <button class="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-6 shadow-lg hover:bg-blue-600" on:click={toggleCreateForm}>
        <span class="text-2xl">➕</span>
    </button>
</div>
