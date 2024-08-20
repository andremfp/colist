<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getListItems, getListDetail, createListItem, updateListItem, getUserDetail, deleteListItem } from '../../../lib/api';
    import type { ListData, ListItemData } from '../../../lib/types';
    import { page } from '$app/stores';
    import { darkMode } from '$lib/stores/darkModeStore';
    import { goto } from '$app/navigation';
    import { tick } from 'svelte';
    import { swipe } from 'svelte-gestures';
    import type { SwipeCustomEvent } from 'svelte-gestures';

    let listItems: ListItemData[] = [];
    let listDetail: ListData = { id: 0, name: '', owner: 0, shared_with: [], item_count: 0, items: [] };
    let listId: number;
    let newItemName = '';
    let isAddingItem = false;
    let sharedWithUsernames: string[] = [];
    let activeEvent: string | null = null;

    const swipeDistance = 100;
    const SWIPE_RESET_DELAY = 100;

    $: listId = parseInt($page.params.id, 10);

    onMount(async () => {
        try {
            const [fetchedListItems, fetchedListDetail] = await Promise.all([
                getListItems(listId),
                getListDetail(listId)
            ]);

            if (fetchedListItems) {
                listItems = fetchedListItems;
                sortItems();
            }

            if (fetchedListDetail) {
                listDetail = fetchedListDetail;
                sharedWithUsernames = await getSharedWithUsers(listDetail.shared_with);
            }

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
        if (!newItemName.trim()) {
            cancelAddItem();
            return;
        }

        try {
            const newListItem = await createListItem(listId, { name: newItemName });
            if (newListItem) {
                listItems.pop(); // Remove the placeholder
                listItems = [...listItems, newListItem];
                sortItems();
            }
        } catch (error) {
            console.error('Failed to create list item:', error);
        } finally {
            newItemName = '';
            isAddingItem = false;
        }
    }

    async function handleDeleteItem(item: ListItemData) {
        try {
            await deleteListItem(listId, item.id);
            listItems = listItems.filter(i => i.id !== item.id);
        } catch (error) {
            console.error('Failed to delete list item:', error);
        }
    }

    function handleSwipe(event: SwipeCustomEvent) {
        activeEvent = 'swipe';
        event.preventDefault();
        event.stopPropagation();

        const listItem = (event.target as HTMLElement)?.closest('li');

        if (listItem) {
            const checkbox = listItem.querySelector('input[type="checkbox"]') as HTMLInputElement | null;

            if (event.detail.direction === 'left') {
                listItem.classList.add('revealed');
                if (checkbox) checkbox.disabled = true;
            } else if (event.detail.direction === 'right') {
                listItem.classList.remove('revealed');
                if (checkbox) {
                    checkbox.disabled = false;
                    setTimeout(() => activeEvent = null, SWIPE_RESET_DELAY);
                }
            }
        } else {
            console.error('List item not found or event.target is null');
        }
    }

    async function handleCheckboxClick(event: MouseEvent, item: ListItemData) {
        if (activeEvent === 'swipe') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        event.stopPropagation();
        await toggleItemCompletion(item);
    }

    async function getSharedWithUsers(sharedWith: number[]): Promise<string[]> {
        try {
            const usernames = await Promise.all(sharedWith.map(async (userId) => {
                const user = await getUserDetail(userId);
                return user ? user.username : null;
            }));
            return usernames.filter((username): username is string => username !== null);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            if (error instanceof Error) showToast(error.message.split('. ')[0]);
            return [];
        }
    }

    function showToast(message: string) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `${$darkMode ? 'bg-fail-toast-bg-dark' : 'bg-fail-toast-bg-light'} text-fail-toast-text fixed top-4 left-1/2 transform -translate-x-1/2 py-2 px-6 rounded-md shadow-lg backdrop-blur-md`;
        toast.style.whiteSpace = 'pre-line';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 8000);
    }

    function addNewItemRow() {
        if (!isAddingItem) {
            isAddingItem = true;
            listItems = [...listItems, { id: 0, name: '', list_id: 0, added_by: 0, checked: false }];
            tick().then(() => document.getElementById('new-item-input')?.focus());
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') handleAddItem();
        if (event.key === 'Escape') cancelAddItem();
    }

    function cancelAddItem() {
        listItems.pop();
        newItemName = '';
        isAddingItem = false;
    }

    function sortItems() {
        listItems = [...listItems].sort((a, b) => Number(a.checked) - Number(b.checked));
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
        const revealedItem = document.querySelector('li.revealed');

        if (revealedItem && !revealedItem.contains(event.target as Node)) {
            revealedItem.classList.remove('revealed');
            const checkbox = revealedItem.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
            if (checkbox) checkbox.disabled = false;
            activeEvent = null;
        }

        if (isAddingItem && newItemInput && !newItemInput.contains(event.target as Node) &&
            addButton && !addButton.contains(event.target as Node)) {
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
            <span class="ri-arrow-left-s-line text-icon-lg mr-2"></span>
            My Lists
        </button>
    </div>
    <h1 class="text-3xl font-bold mb-6">{listDetail.name}</h1>
    <h3 class="text-sm font-bold mb-6">
        {'Shared with: '}
        <span class="font-normal">
            {sharedWithUsernames.length > 0 ? sharedWithUsernames.join(', ') : 'No one'}
        </span>
    </h3>

    {#if listItems.length > 0}
        <div class={`rounded-xl shadow-ios p-4 overflow-hidden ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'}`}>
            <ul class="space-y-2">
                {#each listItems as item, index (item.id)}
                <li 
                    class={`list-item relative flex items-center p-2 ${$darkMode ? 'bg-lists-bg-dark' : 'bg-lists-bg-light'} rounded-lg`}
                    use:swipe={{ timeframe: 300, minSwipeDistance: 60 }} 
                    on:swipe={(event) => handleSwipe(event)}
                >
                    <div class="list-item-content flex items-center w-full">
                        <label class="flex items-center w-full">
                            <input 
                                type="checkbox" 
                                class={`flex-shrink-0 h-5 w-5 appearance-none cursor-pointer border-2 ${$darkMode ? 'border-add-item bg-lists-bg-dark checked:bg-add-item' : 'border-add-item bg-lists-bg-light checked:bg-add-item'} mr-4 rounded focus:ring-0`}
                                checked={item.checked}
                                disabled={isAddingItem && index === listItems.length - 1}
                                on:click={(event) => handleCheckboxClick(event, item)}
                            />
                            {#if isAddingItem && index === listItems.length - 1}
                            <input 
                                id="new-item-input"
                                type="text" 
                                class={`flex-grow p-2 border-2 ${$darkMode ? 'border-input-border-dark bg-input-bg-dark text-input-text-dark' : 'border-input-border-light'} rounded-lg`}
                                bind:value={newItemName}
                                on:keydown={handleKeyDown}
                            />
                            {:else}
                            <span class="flex-grow">{item.name}</span>
                            {/if}
                        </label>
                    </div>

                    <button 
                        class={`absolute top-0 bottom-0 right-0 py-1 text-white rounded-r-lg shadow-lg transition-transform-opacity duration-300 ease-in-out opacity-0 pointer-events-none flex items-center justify-center bg-delete-btn hover:bg-delete-btn-hover`}
                        style={`width: ${swipeDistance}px;`}
                        aria-label="Delete item"
                        on:click={() => handleDeleteItem(item)}
                    >
                        Delete
                    </button>
                </li>
                {#if listItems.length - 1 !== index}
                    <li class={`border-t ${$darkMode ? 'border-border-dark' : 'border-border-light'} mt-2`}></li>
                {/if}
                {/each}
            </ul>
        </div>
    {/if}
    <div class="mt-4">
        <button 
            class={`text-add-item ${$darkMode ? 'hover:text-add-item-hover-dark' : 'hover:text-add-item-hover-light'} text-base font-normal flex items-center`}
            on:click={addNewItemRow}
            aria-label="Add new item"
        >
            <span class="ri-add-line text-icon-lg"></span>
            Add Item
        </button>
    </div>
</div>

<style lang="postcss">
.revealed .list-item-content {
    @apply translate-reveal opacity-70;
}

.revealed button {
    @apply opacity-100 pointer-events-auto;
}

.unrevealed .list-item-content {
    @apply translate-x-0 opacity-100;
}

.unrevealed button {
    @apply opacity-0 pointer-events-none;
}
</style>
