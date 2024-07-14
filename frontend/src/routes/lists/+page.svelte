<script lang="ts">
    import { onMount } from 'svelte';
    import { getLists, createList } from '../../lib/api';
    import type { ListData } from '../../lib/types';
    import { goto } from '$app/navigation';

    let lists: ListData[] = [];
    let newListName = '';
    let sharedWith: number[] = [];

    onMount(async () => {
        try {
            lists = await getLists();
        } catch (error) {
            console.error('Failed to fetch lists:', error);
            // Handle error fetching lists
        }
    });

    async function handleCreateList() {
        try {
            const newList = await createList({ name: newListName, shared_with: sharedWith });
            lists.push(newList);
            goto(`/lists/${newList.id}`);
        } catch (error) {
            console.error('Failed to create list:', error);
            // Handle error creating list
        }
    }
</script>

<div>
    {#if lists && lists.length > 0}
        <ul>
            {#each lists as list (list.id)}
                <li>
                    <a href={`/lists/${list.id}`}><strong>{list.name}</strong></a>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No lists available.</p>
    {/if}

    <!-- Form to create a new list -->
    <div>
        <h2>Create a New List</h2>
        <form on:submit|preventDefault={handleCreateList}>
            <label>
                List Name:
                <input type="text" bind:value={newListName} required />
            </label>
            <!-- Add fields for sharedWith if necessary -->
            <button type="submit">Create List</button>
        </form>
    </div>
</div>
