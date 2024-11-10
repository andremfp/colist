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
	import { pan, type GestureCustomEvent } from 'svelte-gestures';
	import { showToast, sortItems, getSharedWithUsers } from '$lib/utils';
	import { auth } from '$lib/firebase';

	let listItems: ListItem[] = [];
	let listDetail: List = { id: '', name: '', ownerId: '', sharedBy: [], itemCount: 0 };
	let newItemName = '';
	let currentUserId = '';
	let isLoading = true;
	let isAddingItem = false;
	let sharedWithUsernames: string[] = [];
	let swipedItemId: string | null = null;
	let panDistance = 0;
	let startPosition = 0;
	let isPanning = false;

	const swipeDistance = -100;
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
						listItems = sortItems(listItems);
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

	const autoFocus = (node: HTMLElement, shouldFocus: boolean) => {
		if (shouldFocus) {
			node.focus();
		}
		return {
			update(newShouldFocus: boolean) {
				if (newShouldFocus) {
					node.focus();
				}
			}
		};
	};

	async function handleAddItem() {
		if (!newItemName.trim()) return cancelAddItem();

		try {
			swipedItemId = null;
			const newItem = await addListItem({
				name: newItemName,
				listId,
				addedBy: currentUserId,
				checked: false
			});
			listItems.pop(); // Remove placeholder
			listItems = [...listItems, newItem];
			await updateList(listId, { itemCount: listItems.length });
			listItems = sortItems(listItems);
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
			tick().then(() => {
				const inputs = document.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
				inputs[inputs.length - 1]?.focus();
			});
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
			listItems = [...sortItems(listItems.slice(0, -1)), listItems[listItems.length - 1]];
		} catch (error) {
			console.error('Error updating item:', error);
			showToast('Failed to update item.');
		}
	}

	function handlePanDown(gestureEvent: GestureCustomEvent, itemId: string) {
		if (!isPanning) {
			if (!isAddingItem || (isAddingItem && itemId != listItems[listItems.length - 1].id)) {
				startPosition = gestureEvent.detail.x;
				panDistance = 0;
				isPanning = true;
			}
		} else if (swipedItemId === itemId) {
			startPosition = gestureEvent.detail.x;
		} else {
			isPanning = false;
		}
	}

	function handlePanMove(gestureEvent: GestureCustomEvent, itemId: string) {
		if (isPanning) {
			const currentX = gestureEvent.detail.x;
			const distance = currentX - startPosition;

			// Only set swipedItemId if there's actual movement
			if (Math.abs(distance) > 5) {
				// Small threshold to prevent accidental swipes
				swipedItemId = itemId;
			}

			panDistance = Math.max(panDistance + distance, swipeDistance);
			if (panDistance > 0) {
				panDistance = 0;
			}
		}
	}

	function handlePanUp(gestureEvent: GestureCustomEvent) {
		if (panDistance > swipeDistance && panDistance != 0) {
			swipedItemId = null;
			panDistance = 0;
			isPanning = false;
		}
	}

	async function handleCheckboxClick(event: MouseEvent, item: ListItem) {
		event.stopPropagation();
		if (swipedItemId !== null && panDistance !== 0) {
			// If the clicked item is not the swiped item, just revert the swipe
			if (swipedItemId !== item.id) {
				swipedItemId = null;
			}
			event.preventDefault(); // Prevent default click behavior
			return;
		}

		await toggleItemCompletion(item);

		// If we're adding a new item, restore focus and force keyboard
		if (isAddingItem) {
			await tick();
			const inputs = document.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
			const lastInput = inputs[inputs.length - 1];
			lastInput?.focus();
			// Force the keyboard to show by triggering a click
			// lastInput?.click();
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const clickedElement = event.target as HTMLElement;

		// Get the clicked list item's ID and index
		const clickedListItem = clickedElement.closest('li');
		// Only select list items that contain list-item-content, excluding dividers
		const listItems = Array.from(document.querySelectorAll('li:has(.list-item-content)'));
		const clickedIndex = clickedListItem?.querySelector('.list-item-content')
			? listItems.indexOf(clickedListItem)
			: -1;
		const clickedItemId = clickedListItem?.getAttribute('data-item-id') || null;

		if (!clickedElement.closest('.delete-btn') && !clickedElement.closest('.add-item')) {
			// If there's any swiped item, prevent default behavior and only handle swipe-related actions
			if (swipedItemId !== null) {
				event.preventDefault();
				// If clicking outside the swiped item, clear the swipe
				if (swipedItemId !== clickedItemId) {
					swipedItemId = null;
				}
				// Always restore focus to the new item if we're adding one
				if (isAddingItem) {
					tick().then(() => {
						const inputs = document.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
						inputs[inputs.length - 1]?.focus();
					});
				}
				return;
			}

			// Only handle add/cancel if no item is being swiped and not clicking the last item
			if (isAddingItem && clickedIndex !== listItems.length - 1) {
				if (newItemName.trim()) {
					handleAddItem();
				} else {
					cancelAddItem();
				}
			}
		}
	}

	function addNewItemRow() {
		if (!isAddingItem) {
			isAddingItem = true;
			swipedItemId = null;
			listItems = [...listItems, { id: '', name: '', listId: '', addedBy: '', checked: false }];
			tick().then(() => {
				const inputs = document.querySelectorAll('.list-item') as NodeListOf<HTMLElement>;
				inputs[inputs.length - 1]?.focus();
			});
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
		<div class="rounded-xl shadow-ios pl-4 overflow-hidden bg-lists-bg-light dark:bg-lists-bg-dark">
			<ul class="space-y-0">
				{#each listItems as item, index (item.id)}
					<li
						data-item-id={item.id}
						class="relative flex items-center py-2 bg-lists-bg-light dark:bg-lists-bg-dark overflow-hidden"
						use:pan={{ delay: 0, touchAction: 'pan-y', direction: 'horizontal', threshold: 0 }}
						on:pandown={(event) => handlePanDown(event, item.id)}
						on:panmove={(event) => handlePanMove(event, item.id)}
						on:panup={(event) => handlePanUp(event)}
					>
						<div
							class="list-item-content py-2 flex items-center w-full duration-500"
							style={`transform: translateX(${swipedItemId === item.id ? panDistance : 0}px`}
						>
							<label class="w-5 h-5">
								<input
									type="checkbox"
									class="p-2 appearance-none cursor-pointer border-2 border-add-item bg-lists-bg-light dark:bg-lists-bg-dark checked:bg-add-item dark:checked:bg-add-item mr-4 rounded focus:ring-0"
									checked={item.checked}
									disabled={isAddingItem && index === listItems.length - 1}
									on:click={(event) => handleCheckboxClick(event, item)}
								/>
							</label>
							<input
								type="text"
								class="list-item flex-grow pl-4 p-2 focus:outline-none bg-transparent"
								value={index === listItems.length - 1 && isAddingItem ? newItemName : item.name}
								readonly={swipedItemId !== null &&
									!(isAddingItem && index === listItems.length - 1)}
								on:input={(e) => {
									if (index === listItems.length - 1 && isAddingItem) {
										newItemName = e.currentTarget.value;
									} else {
										item.name = e.currentTarget.value;
										updateListItem(item.id, { name: item.name });
									}
								}}
								on:keydown={handleKeyDown}
								use:autoFocus={isAddingItem && index === listItems.length - 1}
							/>
						</div>

						<button
							class="delete-btn absolute top-0 bottom-0 right-0 p-0 text-white shadow-lg bg-delete-btn duration-500"
							style={`width: ${swipedItemId === item.id ? Math.abs(panDistance) : 0}px;`}
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
