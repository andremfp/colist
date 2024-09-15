<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		fetchLists,
		addList,
		fetchAllUserProfilesExceptCurrent,
		deleteList
	} from '../../lib/api';
	import type { List, UserData } from '../../lib/types';
	import { goto } from '$app/navigation';
	import { darkMode } from '$lib/stores/darkModeStore';
	import { swipe } from 'svelte-gestures';
	import type { SwipeCustomEvent } from 'svelte-gestures';
	import { auth } from '../../lib/firebase';

	let lists: List[] = [];
	let users: UserData[] = [];
	let newListName = '';
	let selectedUser = 'None';
	let showCreateForm = false;
	let currentUserId = '';
	let isLoading = true;
	let swipedListId: string | null = null;

	const swipeDistance = 100;
	$: isDoneActive = newListName.trim() !== '';

	onMount(async () => {
		try {
			auth.onAuthStateChanged(async (user) => {
				if (user) {
					currentUserId = user.uid;
					users = await fetchAllUserProfilesExceptCurrent(currentUserId);
					lists = (await fetchLists()) || [];
					isLoading = false;
				} else {
					console.log('User not detected, redirecting to login');
					goto('/');
				}
			});
			document.addEventListener('click', handleClickOutside);
		} catch (error) {
			console.error('Failed to initialize authentication or fetch data:', error);
		}
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('click', handleClickOutside);
		}
	});

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
				showCreateForm = false;
				goto(`/lists/${newList.id}`);
			}
		} catch (error) {
			console.error('Failed to create list:', error);
		}
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

	function handleSwipe(event: SwipeCustomEvent, listId: string) {
		if (event.detail.direction === 'left') {
			swipedListId = listId;
		} else if (event.detail.direction === 'right' && swipedListId === listId) {
			swipedListId = null;
		}
	}

	function handleListItemClick(event: MouseEvent, listId: string) {
		// Prevent navigation if any list item is swiped
		if (swipedListId !== null) {
			// If the clicked item is not the swiped item, just revert the swipe
			if (swipedListId !== listId) {
				swipedListId = null;
			}
			event.preventDefault(); // Prevent default click behavior
			return;
		}
		// Proceed to navigation if no swipe is active
		goto(`/lists/${listId}`);
	}

	function handleClickOutside(event: MouseEvent) {
		const clickedElement = event.target as HTMLElement;
		if (!clickedElement.closest('.list-item') && !clickedElement.closest('.delete-btn')) {
			swipedListId = null;
		}
	}

	function toggleCreateForm() {
		showCreateForm = !showCreateForm;
	}
</script>

<div class="p-4 bg-main-bg-light text-text-light dark:bg-main-bg-dark dark:text-text-dark">
	{#if isLoading}
		<p>Loading...</p>
	{:else}
		<h1 class="text-3xl font-bold mb-6">My Lists</h1>

		<div class="flex flex-col">
			{#if lists.length > 0}
				<ul class="space-y-2 overflow-hidden">
					{#each lists as list (list.id)}
						<li
							class="list-item relative flex items-center rounded-xl shadow-ios overflow-hidden bg-lists-bg-light dark:bg-lists-bg-dark"
							use:swipe={{ timeframe: 300, minSwipeDistance: 60 }}
							on:swipe={(event) => handleSwipe(event, list.id)}
						>
							<!-- List item content -->
							<div
								class="flex items-center w-full transition-transform duration-300 ease-in-out"
								style={`transform: translateX(${swipedListId === list.id ? `-${swipeDistance}px` : '0'});`}
							>
								<button
									class="w-full flex items-center justify-between p-4 text-left"
									on:click={(event) => handleListItemClick(event, list.id)}
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
											<small class="text-list-shared-light dark:text-list-shared-dark">Shared</small
											>
										{/if}
										<span class="text-list-item-count-light dark:text-list-item-count-dark">
											{list.itemCount}
										</span>
										<span class="ri-arrow-right-s-line text-xl"></span>
									</div>
								</button>
							</div>

							<!-- Delete button -->
							<button
								class="delete-btn absolute top-0 bottom-0 right-0 py-1 px-4 text-white shadow-lg bg-delete-btn transition-transform duration-300 ease-in-out"
								style={`width: ${swipeDistance}px; transform: translateX(${swipedListId === list.id ? '0' : `${swipeDistance}px`});`}
								aria-label="Delete list"
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

			<div class="mt-4 flex justify-end">
				<button
					class="text-button-blue text-base"
					on:click={toggleCreateForm}
					aria-label="Add new list"
				>
					Add List
				</button>
			</div>
		</div>

		{#if showCreateForm}
			<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div class="bg-opacity-75 bg-black fixed inset-0 z-0"></div>
				<div
					class="relative z-10 p-6 border rounded-xl max-w-md w-full border-border-light bg-main-bg-light dark:border-border-dark dark:bg-main-bg-dark"
				>
					<div class="flex justify-between items-center mb-4">
						<button
							class="text-sm text-button-blue"
							on:click={toggleCreateForm}
							aria-label="Cancel"
						>
							Cancel
						</button>
						<h2 class="text-xl font-semibold">New List</h2>
						<button
							class={`text-sm ${isDoneActive ? `text-button-blue cursor-pointer` : 'text-button-disabled'}`}
							on:click={handleCreateList}
							aria-label="Done"
							disabled={!isDoneActive}
						>
							Done
						</button>
					</div>
					<form on:submit|preventDefault={handleCreateList} class="space-y-4">
						<label class="block">
							List Name:
							<input
								type="text"
								bind:value={newListName}
								required
								class="mt-2 block w-full p-3 border rounded-md border-input-border-light dark:border-input-border-dark dark:bg-input-bg-dark dark:text-input-text-dark"
							/>
						</label>

						<label class="block">
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
	{/if}
</div>
