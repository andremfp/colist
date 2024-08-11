<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getListItems, getListDetail, createListItem, updateListItem } from '../../../lib/api';
    import type { ListData, ListItemData } from '../../../lib/types';
    import { page } from '$app/stores';
    import { darkMode } from '$lib/stores/darkModeStore';
    import { goto } from '$app/navigation';
    import { tick } from 'svelte';

    let listItems: ListItemData[] = [];
    let listDetail: ListData = { id: 0, name: '', owner: 0, shared_with: [], item_count: 0, items: [] };
    let listId: number;
    let newItemName = '';
    let isAddingItem = false;

    $: listId = parseInt($page.params.id, 10);

    onMount(async () => {
        try {
            const fetchedListItems = await getListItems(listId);
            const fetchedListDetail = await getListDetail(listId);

            if (fetchedListItems) {
                listItems = fetchedListItems;
                sortItems(); // Sort items on initial load
            }

            if (fetchedListDetail) {
                listDetail = fetchedListDetail;
            }

            // Add the click listener to cancel new item on outside click
            document.addEventListener('click', handleClickOutside);

        } catch (error) {
            console.error('Failed to fetch list details:', error);
        }
    });

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', handleClickOutside);
        }
    });

    async function handleAddItem() {
        if (newItemName.trim() === '') {
            cancelAddItem();
            return;
        }
        try {
            const newListItem = await createListItem(listId, { name: newItemName });
            if (newListItem) {
                listItems.pop(); // Remove the placeholder
                listItems = [...listItems, newListItem];
                sortItems();
            } else {
                console.error('Failed to create list item.');
            }
        } catch (error) {
            console.error('Failed to create list item:', error);
        }
        newItemName = '';
        isAddingItem = false;
    }

    function addNewItemRow() {
        if (!isAddingItem) {
            isAddingItem = true;
            listItems = [...listItems, { id: 0, name: '', list_id: 0, added_by: 0, checked: false }];
            tick().then(() => {
                document.getElementById('new-item-input')?.focus();
            });
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleAddItem();
        } else if (event.key === 'Escape') {
            cancelAddItem();
        }
    }

    function cancelAddItem() {
        listItems.pop();
        newItemName = '';
        isAddingItem = false;
    }

    function sortItems() {
        listItems = listItems.slice().sort((a, b) => Number(a.checked) - Number(b.checked));
    }

    async function toggleItemCompletion(item: ListItemData) {
        try {
            const updatedItem = await updateListItem(listId, item.id, { name: item.name, checked: !item.checked });
            if (updatedItem) {
                item.checked = updatedItem.checked;
                sortItems();
            }
        } catch (error) {
            console.error('Failed to update list item:', error);
        }
    }

    function handleClickOutside(event: MouseEvent) {
    const newItemInput = document.getElementById('new-item-input');
    const addButton = document.querySelector('[aria-label="Add new item"]');

    if (
        isAddingItem && 
        newItemInput && 
        !newItemInput.contains(event.target as Node) &&
        addButton && 
        !addButton.contains(event.target as Node)
    ) {
        cancelAddItem();
    }
}


    function goBack() {
        goto('/lists');
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

    {#if listItems.length > 0}
        <div class={`rounded-xl shadow-ios p-4 ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'}`}>
                <ul class="space-y-2">
                    {#each listItems as item, index (item.id)}
                        <li class={`flex items-center p-2 ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'} rounded-lg`}>
                            <label class="flex items-center w-full">
                                <input 
                                    type="checkbox" 
                                    class={`flex-shrink-0 h-5 w-5 appearance-none cursor-pointer border-2 ${$darkMode ? 'border-add-item bg-lists-bg-dark checked:bg-add-item' : 'border-add-item bg-lists-bg-light checked:bg-add-item'} mr-4 rounded focus:ring-0`}
                                    checked={item.checked}
                                    on:change={() => toggleItemCompletion(item)}
                                    disabled={isAddingItem && index === listItems.length - 1}
                                />
                                {#if isAddingItem && index === listItems.length - 1}
                                    <input 
                                        id="new-item-input"
                                        class={`flex border-b-2 w-full ${$darkMode ? 'border-add-item-hover-dark bg-lists-bg-dark text-text-dark' : 'border-add-item-hover-light bg-lists-bg-light text-text-light'} focus:outline-none`}
                                        bind:value={newItemName}
                                        on:keydown={handleKeyDown}
                                        placeholder="Enter item name..."
                                    />
                                {:else}
                                    <span class={`text-base font-medium ${$darkMode ? 'text-text-dark' : 'text-text-light'}`}>{item.name}</span>
                                {/if}
                            </label>
                        </li>
                        {#if listItems.length - 1 !== index}
                            <li class={`border-t ${$darkMode ? 'border-border-dark' : 'border-border-light'}`}></li>
                        {/if}
                    {/each}
                </ul>
        </div>
    {:else}
        <p class="text-lg">No items in the list.</p>
    {/if}

    <div class="mt-4 flex justify-start">
        <button 
            class={`text-add-item ${$darkMode ? 'hover:text-add-item-hover-dark' : 'hover:text-add-item-hover-light'} text-base font-bold flex items-center`}
            on:click={addNewItemRow}
            aria-label="Add new item"
        >
            <span class="ri-add-line text-icon-medium mr-1"></span>
            Add Item
        </button>
    </div>
</div>
