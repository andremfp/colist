<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { pan, type GestureCustomEvent } from 'svelte-gestures';
	import { auth } from '../../lib/firebase';
	import {
		fetchLists,
		addList,
		fetchAllUserProfilesExceptCurrent,
		deleteList
	} from '../../lib/api';
	import type { List, UserData } from '../../lib/types';

	let lists: List[] = [];
	let users: UserData[] = [];
	let currentUserId = '';
	let isLoading = true;
	let showCreateForm = false;
	let swipedListId: string | null = null;
	let panDistance = 0;
	let startPosition = 0;
	let isPanning = false;
	let newListName = '';
	let selectedUser = 'None';

	const swipeDistance = -100;

	$: isDoneActive = newListName.trim() !== '';

	onMount(() => {
		const handleCreateListForm = () => {
			console.log('Received showCreateListForm event');
			showCreateForm = true;
		};

		// Set up auth state change handler immediately
		auth.onAuthStateChanged(handleAuthStateChange);

		// Add event listeners
		window.addEventListener('showCreateListForm', handleCreateListForm);
		document.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('showCreateListForm', handleCreateListForm);
			document.removeEventListener('click', handleClickOutside);
		};
	});

	async function handleAuthStateChange(user: any) {
		if (user) {
			currentUserId = user.uid;
			await Promise.all([fetchUserData(), fetchListsData()]);
			isLoading = false;
		} else {
			console.log('User not detected, redirecting to login');
			goto('/');
		}
	}

	async function fetchUserData() {
		try {
			users = await fetchAllUserProfilesExceptCurrent(currentUserId);
		} catch (error) {
			console.error('Failed to fetch user profiles:', error);
		}
	}

	async function fetchListsData() {
		try {
			lists = (await fetchLists()) || [];
		} catch (error) {
			console.error('Failed to fetch lists:', error);
		}
	}

	async function handleCreateList() {
		if (!newListName.trim()) return;
		try {
			const newSharedWith = selectedUser !== 'None' ? [selectedUser, currentUserId] : [];
			const newList = await addList({
				name: newListName,
				ownerId: currentUserId,
				sharedBy: newSharedWith
			});
			if (newList) {
				lists = [...lists, newList];
				resetCreateForm();
				goto(`/lists/${newList.id}`);
			}
		} catch (error) {
			console.error('Failed to create list:', error);
		}
	}

	function resetCreateForm() {
		showCreateForm = false;
		newListName = '';
		selectedUser = 'None';
	}

	async function handleDeleteList(listId: string) {
		try {
			await deleteList(listId);
			lists = lists.filter((list) => list.id !== listId);
			swipedListId = null;
		} catch (error) {
			console.error('Failed to delete list:', error);
		}
	}

	function handlePanDown(gestureEvent: GestureCustomEvent, itemId: string) {
		if (!isPanning) {
			swipedListId = itemId;
			startPosition = gestureEvent.detail.x;
			panDistance = 0;
			isPanning = true;
		} else if (swipedListId === itemId) {
			startPosition = gestureEvent.detail.x;
		} else {
			isPanning = false;
		}
	}

	function handlePanMove(gestureEvent: GestureCustomEvent) {
		if (isPanning) {
			const currentX = gestureEvent.detail.x;
			const distance = currentX - startPosition;
			panDistance = Math.max(panDistance + distance, swipeDistance);
			if (panDistance > 0) {
				panDistance = 0;
			}
		}
	}

	function handlePanUp(gestureEvent: GestureCustomEvent) {
		if (panDistance > swipeDistance && panDistance != 0) {
			swipedListId = null;
			panDistance = 0;
			isPanning = false;
		}
	}

	function handleListClick(event: MouseEvent, listId: string) {
		if (swipedListId !== null && panDistance !== 0) {
			swipedListId = swipedListId !== listId ? null : swipedListId;
			event.preventDefault();
			return;
		}
		goto(`/lists/${listId}`);
	}

	function handleClickOutside(event: MouseEvent) {
		const clickedElement = event.target as HTMLElement;
		if (!clickedElement.closest('.list-item') && !clickedElement.closest('.delete-btn')) {
			swipedListId = null;
			panDistance = 0;
			isPanning = false;
		}
	}
</script>

<div class="p-4 bg-main-bg-light text-text-light dark:bg-main-bg-dark dark:text-text-dark">
	<h1 class="text-3xl font-bold mb-6">My Lists</h1>

	<div class="flex flex-col">
		{#if lists.length > 0}
			<ul class="space-y-2 overflow-hidden">
				{#each lists as list (list.id)}
					<li
						class="list-item relative flex items-center rounded-xl shadow-ios overflow-hidden bg-lists-bg-light dark:bg-lists-bg-dark"
						use:pan={{ delay: 0, touchAction: 'pan-y', direction: 'horizontal', threshold: 0 }}
						on:pandown={(event) => handlePanDown(event, list.id)}
						on:panmove={(event) => handlePanMove(event)}
						on:panup={(event) => handlePanUp(event)}
					>
						<div
							class="flex items-center w-full duration-500"
							style={`transform: translateX(${swipedListId === list.id ? panDistance : 0}px`}
						>
							<button
								class="w-full flex items-center justify-between p-4 text-left"
								on:click={(event) => handleListClick(event, list.id)}
								aria-label={`View details of ${list.name}`}
							>
								<div class="flex items-center space-x-4">
									<span class="ri-list-check text-xl"></span>
									<div>
										<strong class="text-lg font-semibold">{list.name}</strong>
									</div>
								</div>
								<div class="flex items-center space-x-4">
									{#if list.sharedBy.length > 0}
										<small class="text-list-shared-light dark:text-list-shared-dark">Shared</small>
									{/if}
									<span class="text-list-item-count-light dark:text-list-item-count-dark">
										{list.itemCount}
									</span>
									<span class="ri-arrow-right-s-line text-xl"></span>
								</div>
							</button>
						</div>

						<button
							class="delete-btn absolute top-0 bottom-0 right-0 p-0 text-white shadow-lg bg-delete-btn duration-500"
							style={`width: ${swipedListId === list.id ? Math.abs(panDistance) : 0}px;`}
							aria-label="Delete item"
							on:click={() => handleDeleteList(list.id)}
						>
							Delete
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-lg">No lists available.</p>
		{/if}
	</div>

	{#if showCreateForm}
		<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div class="bg-opacity-75 bg-black fixed inset-0 z-0"></div>
			<div
				class="relative z-10 p-6 border rounded-xl max-w-md w-full border-border-light bg-main-bg-light dark:border-border-dark dark:bg-main-bg-dark"
			>
				<div class="flex justify-between items-center mb-4">
					<button
						class="text-text-m text-button-blue"
						on:click={resetCreateForm}
						aria-label="Cancel"
					>
						Cancel
					</button>
					<h2 class="text-xl font-semibold">New List</h2>
					<button
						class={`text-text-m ${isDoneActive ? 'text-button-blue cursor-pointer' : 'text-button-disabled'}`}
						on:click={handleCreateList}
						aria-label="Done"
						disabled={!isDoneActive}
					>
						Done
					</button>
				</div>
				<form on:submit|preventDefault={handleCreateList} class="space-y-4, text-text-m">
					<label class="block">
						List Name:
						<input
							type="text"
							bind:value={newListName}
							required
							class="mt-2 block w-full p-3 border rounded-md border-input-border-light dark:border-input-border-dark dark:bg-input-bg-dark dark:text-input-text-dark"
						/>
					</label>

					<label class="block mt-2">
						Share with:
						<div class="relative">
							<select
								name="users"
								bind:value={selectedUser}
								class="mt-2 block w-full p-3 border rounded-md appearance-none border-input-border-light dark:border-input-border-dark dark:bg-input-bg-dark dark:text-input-text-dark"
							>
								<option value="None">None</option>
								{#each users as user (user.id)}
									<option value={user.id}>{user.name}</option>
								{/each}
							</select>

							<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
								<svg
									class="w-4 h-4 text-input-border-light dark:text-input-text-dark"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 9l6 6 6-6"
									/>
								</svg>
							</div>
						</div>
					</label>
				</form>
			</div>
		</div>
	{/if}
</div>
