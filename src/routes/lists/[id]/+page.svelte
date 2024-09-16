<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		fetchListItems,
		addListItem,
		updateListItem,
		updateList,
		deleteListItem,
		fetchListById
	} from '$lib/api';
	import type { List, ListItem } from '$lib/types';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { swipe } from 'svelte-gestures';
	import type { SwipeCustomEvent } from 'svelte-gestures';
	import { showToast, sortItems, getSharedWithUsers } from '$lib/utils';
	import { auth } from '$lib/firebase';

	let listItems: ListItem[] = [];
	let listDetail: List = { id: '', name: '', ownerId: '', sharedBy: [], itemCount: 0 };
	let newItemName = '';
	let currentUserId = '';
	let isLoading = true;
	let isAddingItem = false;
	let sharedWithUsernames: string[] = [];
	let swipedListId: string | null = null;

	const swipeDistance = 100;
	const SWIPE_RESET_DELAY = 100;
	$: listId = $page.params.id;

	onMount(async () => {
		try {
			auth.onAuthStateChanged(async (user) => {
				if (user) {
					currentUserId = user.uid;
					const [fetchedListItems, fetchedListDetail] = await Promise.all([
						fetchListItems(listId),
						fetchListById(listId)
					]);

					if (fetchedListItems) {
						listItems = fetchedListItems;
						sortItems(listItems);
					}

					if (fetchedListDetail) {
						listDetail = fetchedListDetail;
						sharedWithUsernames = await getSharedWithUsers(listDetail.sharedBy, currentUserId);
					}
					isLoading = false;
				} else {
					console.log('User not detected, redirecting to login');
					goto('/');
				}
			});

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
		if (!newItemName.trim()) return cancelAddItem();

		try {
			const newItem = await addListItem({
				name: newItemName,
				listId,
				addedBy: currentUserId,
				checked: false
			});
			listItems.pop(); // Remove placeholder
			listItems = [...listItems, newItem];
			await updateList(listId, { itemCount: listItems.length });
			sortItems(listItems);
		} catch (error) {
			console.error('Error adding item:', error);
			showToast('Failed to add item.');
		} finally {
			newItemName = '';
			isAddingItem = false;
		}
	}

	async function handleDeleteItem(item: ListItem) {
		try {
			await deleteListItem(item.id);
			listItems = listItems.filter((i) => i.id !== item.id);
			await updateList(listId, { itemCount: listItems.length });
		} catch (error) {
			console.error('Error deleting item:', error);
			showToast('Failed to delete item.');
		}
	}

	async function toggleItemCompletion(item: ListItem) {
		try {
			const updatedId = await updateListItem(item.id, { checked: !item.checked });
			listItems = listItems.map((i) => (i.id === updatedId ? { ...i, checked: !i.checked } : i));
			sortItems(listItems);
		} catch (error) {
			console.error('Error updating item:', error);
			showToast('Failed to update item.');
		}
	}

	function handleSwipe(event: SwipeCustomEvent, listId: string) {
		if (event.detail.direction === 'left') {
			swipedListId = listId;
		} else if (event.detail.direction === 'right' && swipedListId === listId) {
			swipedListId = null;
		}
	}

	async function handleCheckboxClick(event: MouseEvent, item: ListItem) {
		if (isAddingItem) {
			// Prevent any item from being checked if a new item is being added
			event.preventDefault();
			return;
		}
		if (swipedListId !== null) {
			// If the clicked item is not the swiped item, just revert the swipe
			if (swipedListId !== listId) {
				swipedListId = null;
			}
			event.preventDefault(); // Prevent default click behavior
			return;
		}
		await toggleItemCompletion(item);
	}

	function handleClickOutside(event: MouseEvent) {
		const clickedElement = event.target as HTMLElement;
		if (
			!clickedElement.closest('.new-list-item') &&
			!clickedElement.closest('.delete-btn') &&
			!clickedElement.closest('.add-item')
		) {
			if (isAddingItem) {
				cancelAddItem();
				event.preventDefault();
				swipedListId = null;
			} else {
				swipedListId = null;
			}
		}

		if (clickedElement.closest('.new-list-item') && swipedListId !== null) {
			swipedListId = null;
		}
	}

	function addNewItemRow() {
		if (!isAddingItem) {
			isAddingItem = true;
			swipedListId = null;
			listItems = [...listItems, { id: '', name: '', listId: '', addedBy: '', checked: false }];
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

	function goBack() {
		goto('/lists');
	}
</script>

<div class="p-4 bg-main-bg-light dark:bg-main-bg-dark text-text-light dark:text-text-dark">
	<div class="flex items-center mb-6">
		<button on:click={goBack} class="flex items-center text-lg font-bold">
			<span class="ri-arrow-left-s-line text-icon-lg mr-2"></span> My Lists
		</button>
	</div>

	<h1 class="text-3xl font-bold mb-6">{listDetail.name}</h1>
	<h3 class="text-sm font-bold mb-6">
		Shared with: <span class="font-normal"
			>{sharedWithUsernames.length > 0 ? sharedWithUsernames.join(', ') : 'No one'}</span
		>
	</h3>

	{#if listItems.length > 0}
		<div class="rounded-xl shadow-ios p-4 overflow-hidden bg-lists-bg-light dark:bg-lists-bg-dark">
			<ul class="space-y-2">
				{#each listItems as item, index (item.id)}
					<li
						class="relative flex items-center p-2 bg-lists-bg-light dark:bg-lists-bg-dark rounded-lg overflow-hidden"
						use:swipe={{ timeframe: 300, minSwipeDistance: 60 }}
						on:swipe={(event) => handleSwipe(event, item.id)}
					>
						<div
							class="list-item-content flex items-center w-full transition-transform duration-300 ease-in-out"
							style={`transform: translateX(${swipedListId === item.id ? `-${swipeDistance}px` : '0'});`}
						>
							<label class="flex items-center w-full">
								<input
									type="checkbox"
									class="flex-shrink-0 h-5 w-5 appearance-none cursor-pointer border-2 border-add-item bg-lists-bg-light dark:bg-lists-bg-dark checked:bg-add-item dark:checked:bg-add-item mr-4 rounded focus:ring-0"
									checked={item.checked}
									disabled={isAddingItem && index === listItems.length - 1}
									on:click={(event) => handleCheckboxClick(event, item)}
								/>
								{#if isAddingItem && index === listItems.length - 1}
									<input
										id="new-item-input"
										type="text"
										class="new-list-item flex-grow p-2 border-2 border-input-border-light dark:border-input-border-dark bg-input-bg-light dark:bg-input-bg-dark text-input-text-light dark:text-input-text-dark rounded-lg"
										bind:value={newItemName}
										on:keydown={handleKeyDown}
									/>
								{:else}
									<span class="flex-grow">{item.name}</span>
								{/if}
							</label>
						</div>

						<button
							class="delete-btn absolute top-0 bottom-0 right-0 py-1 px-4 text-white shadow-lg bg-delete-btn transition-transform duration-300 ease-in-out"
							style={`width: ${swipeDistance}px; transform: translateX(${swipedListId === item.id ? '0' : `${swipeDistance}px`});`}
							aria-label="Delete item"
							on:click={() => handleDeleteItem(item)}
						>
							Delete
						</button>
					</li>
					{#if listItems.length - 1 !== index}
						<li class="border-t border-border-light dark:border-border-dark mt-2"></li>
					{/if}
				{/each}
			</ul>
		</div>
	{/if}
	<div class="mt-4">
		<button
			class="add-item text-add-item text-base font-normal flex items-center"
			on:click={addNewItemRow}
			aria-label="Add new item"
		>
			<span class="ri-add-line text-icon-lg"></span>
			Add Item
		</button>
	</div>
</div>
