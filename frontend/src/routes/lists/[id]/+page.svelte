<script lang="ts">
    import { onMount } from 'svelte';
    import { getListItems, getListDetail, createListItem } from '../../../lib/api';
    import type { ListData, ListItemData } from '../../../lib/types';
    import { page } from '$app/stores';
    import { darkMode } from '$lib/stores/darkModeStore';
    import { goto } from '$app/navigation';

    let listItems: ListItemData[] = [];
    let listDetail: ListData = { id: 0, name: '', owner: 0, shared_with: [], item_count: 0, items: [] };
    let listId: number;
    let newItemName = '';
    let showAddItemForm = false;

    $: listId = parseInt($page.params.id, 10);
    $: isDoneActive = newItemName.trim() !== '';

    onMount(async () => {
        try {
            const fetchedListItems = await getListItems(listId);
            const fetchedListDetail = await getListDetail(listId);

            if (fetchedListItems) {
                listItems = fetchedListItems;
            }

            if (fetchedListDetail) {
                listDetail = fetchedListDetail;
            }
        } catch (error) {
            console.error('Failed to fetch list details:', error);
        }
    });

    function goBack() {
        goto('/lists');
    }

    async function handleAddItem() {
        if (newItemName.trim() === '') return;
        try {
            const newListItem = await createListItem(listId, { name: newItemName });
            if (newListItem) {
                listItems = [...listItems, newListItem];
                showAddItemForm = false;
            } else {
                console.error('Failed to create list: No list data returned.');
            }
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    }

    function toggleAddItemForm() {
        showAddItemForm = !showAddItemForm;
    }
</script>

<div class={$darkMode ? 'p-4 bg-main-bg-dark text-text-dark' : 'p-4 bg-main-bg-light text-text-light'}>
    <div class="flex items-center mb-6">
        <button on:click={goBack} class="flex items-center text-lg font-bold">
            <span class="ri-arrow-left-s-line text-icon-large mr-2"></span>
            My Lists
        </button>
    </div>
    <h1 class="text-3xl font-bold mb-6">{listDetail.name}</h1>

    {#if listItems && listItems.length > 0}
    <div class={`rounded-xl shadow-ios p-4 ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'}`}>
        <ul class="space-y-2">
            {#each listItems as item, index (item.id)}
                <li class={`flex items-center p-2 ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'} rounded-lg`}>
                    <label class="flex items-center">
                        <!-- Custom checkbox with full color change -->
                        <input 
                            type="checkbox" 
                            class={`h-5 w-5 appearance-none cursor-pointer border-2 ${$darkMode ? 'border-add-item bg-lists-bg-dark checked:bg-add-item' : 'border-add-item bg-lists-bg-light checked:bg-add-item'} mr-4 rounded focus:ring-0`}
                        />
                        <span class={`text-base font-medium ${$darkMode ? 'text-text-dark' : 'text-text-light'}`}>{item.name}</span>
                    </label>
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

    <div class="mt-4 flex justify-start">
        <button 
            class={`text-add-item ${$darkMode ? 'hover:text-add-item-hover-dark' : 'hover:text-add-item-hover-light'} text-base font-bold flex items-center`}
            on:click={toggleAddItemForm}
            aria-label="Add new item"
        >
            <span class="ri-add-line text-icon-medium mr-1"></span>
            Add Item
        </button>
    </div>

    {#if showAddItemForm}
        <div class={`fixed inset-0 flex items-center justify-center z-50`}>
            <div class={`p-6 border rounded-xl ${$darkMode ? 'border-border-dark bg-main-bg-dark' : 'border-border-light bg-main-bg-light'} max-w-md w-full`}>
                <div class="flex justify-between items-center mb-4">
                    <button 
                        on:click={toggleAddItemForm} 
                        class={`text-sm text-button-blue ${$darkMode ? 'hover:text-button-blue-hover-dark' : 'hover:text-button-blue-hover-light'}`}
                        aria-label="Cancel"
                    >
                        Cancel
                    </button>
                    <h2 class="text-xl font-semibold">New Item</h2>
                    <button 
                        on:click={handleAddItem}
                        class={`text-sm ${isDoneActive ? 'text-button-blue cursor-pointer ' + ($darkMode ? 'hover:text-button-blue-hover-dark' : 'hover:text-button-blue-hover-light') : 'text-button-disabled'}`}
                        aria-label="Done"
                        disabled={!isDoneActive} 
                    >
                        Done
                    </button>
                </div>
                <form on:submit|preventDefault={handleAddItem} class="space-y-4">
                    <label class="block">
                        List Name:
                        <input type="text" bind:value={newItemName} required 
                               class={`mt-2 block w-full p-3 border rounded-md 
                                      ${$darkMode ? 'border-input-border-dark bg-input-bg-dark text-input-text-dark' : 'border-input-border-light'}`} />
                    </label>
                </form>
            </div>
        </div>
    {/if}
</div>
