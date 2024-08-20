<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { getLists, createList, getUsers, deleteList } from '../../lib/api';
    import type { ListData, UserData} from '../../lib/types';
    import { goto } from '$app/navigation';
    import { darkMode } from '$lib/stores/darkModeStore';
    import { swipe } from 'svelte-gestures';
    import type { SwipeCustomEvent } from 'svelte-gestures';

    let lists: ListData[] = [];
    let users: UserData[] = [];
    let newListName = '';
    let selectedUser = 'None';
    let sharedWith: number[] = [];
    let showCreateForm = false;
    let userId: string;
    let activeEvent: string | null = null;

    const swipeDistance = 100;
    const SWIPE_RESET_DELAY = 100;

    // Reactive statement to determine if the "Done" button should be active
    $: isDoneActive = newListName.trim() !== '';

    onMount(async () => {
        userId = localStorage.getItem('user_id') || '';
        users = await listUsers();

        try {
            document.addEventListener('click', handleClickOutside);
            const fetchedLists = await getLists();
            if (fetchedLists) {
                lists = fetchedLists;
            } else {
                lists = [];
            }
        } catch (error) {
            console.error('Failed to fetch lists:', error);
        }
    });

    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('click', handleClickOutside);
        }
    });

    async function handleCreateList() {
        if (newListName.trim() === '') return; // Do not proceed if the name is empty
        try {
            if (selectedUser !== 'None') {
                sharedWith.push(parseInt(selectedUser));
            }
            const newList = await createList({ name: newListName, shared_with: sharedWith });
            if (newList) {
                lists = [...lists, newList];
                goto(`/lists/${newList.id}`);
                showCreateForm = false; // Optionally close the form after submission
            } else {
                console.error('Failed to create list: No list data returned.');
            }
        } catch (error) {
            console.error('Failed to create list:', error);
        }
    }

    async function handleDeleteList(listId: number) {
        try {
            await deleteList(listId);
            lists = lists.filter(list => list.id !== listId);
        } catch (error) {
            console.error('Failed to delete list:', error);
        }
    }

    function handleSwipe(event: SwipeCustomEvent) {
        activeEvent = 'swipe';
        event.preventDefault();
        event.stopPropagation();

        const list = (event.target as HTMLElement)?.closest('li');

        if (list) {
            if (event.detail.direction === 'left') {
                list.classList.add('revealed');
            } else if (event.detail.direction === 'right') {
                list.classList.remove('revealed');
            }
        } else {
            console.error('List not found or event.target is null');
        }
    }

    async function handleButtonClick(event: MouseEvent, listId: number) {
        if (activeEvent === 'swipe') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        event.stopPropagation();
        goto(`/lists/${listId}`);
    }

    function handleClickOutside(event: MouseEvent) {
        const revealedItem = document.querySelector('li.revealed');

        if (revealedItem && !revealedItem.contains(event.target as Node)) {
            revealedItem.classList.remove('revealed');
            activeEvent = null;
        }
    }

    async function listUsers() {
        try {
            const users = await getUsers();
            if (users) {
                return users.filter(user => user.id !== parseInt(userId || '0'));
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching users:', error);

            if (error instanceof Error) {
                showToast(error.message.split('. ')[0]);
            }
            return [];
        }
    }

    function showToast(message: string) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `${$darkMode ? 'bg-fail-toast-bg-dark' : 'bg-fail-toast-bg-light'} text-fail-toast-text fixed top-4 left-1/2 transform -translate-x-1/2 py-2 px-6 rounded-md shadow-lg backdrop-blur-md`;
        toast.style.whiteSpace = 'pre-line';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 8000);
    }

    function toggleCreateForm() {
        showCreateForm = !showCreateForm;
    }

</script>

<div class={$darkMode ? 'p-4 bg-main-bg-dark text-text-dark' : 'p-4 bg-main-bg-light text-text-light'}>
    <h1 class="text-3xl font-bold mb-6">My Lists</h1>

    <div class="flex flex-col">
        <div class="flex-grow">
            {#if lists.length > 0}
            <ul class="space-y-2 overflow-hidden">
                {#each lists as list (list.id)}
                    <li class={`relative flex rounded-xl shadow-ios transition-colors duration-200 ${$darkMode ? 'bg-lists-bg-dark hover:bg-lists-hover-dark' : 'bg-lists-bg-light hover:bg-lists-hover-light'}`}
                    use:swipe={{ timeframe: 300, minSwipeDistance: 60 }}
                    on:swipe={(event) => handleSwipe(event)}
                    >
                        <div class="list-content flex items-center w-full">
                            <button 
                                class="w-full flex items-center justify-between p-4 text-left bg-transparent cursor-default"
                                on:click={(event) => handleButtonClick(event, list.id)}
                                aria-label={`View details of ${list.name}`}
                            >
                                <div class=" flex items-center space-x-4">
                                    <span class="ri-list-check text-xl"></span>
                                    <div class="flex-grow">
                                        <strong class="text-lg font-semibold">{list.name}</strong>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    {#if list.shared_with.length > 0}
                                        <small class={`text-xs ${$darkMode ? 'text-list-shared-dark' : 'text-list-shared-light'}`}>Shared</small>
                                    {/if}
                                    <span class={`text-sm ${$darkMode ? 'text-list-item-count-dark' : 'text-list-item-count-light'}`}>{list.item_count}</span>
                                    <span class="ri-arrow-right-s-line text-xl"></span>
                                </div>
                            </button>
                        </div>

                        <button 
                            class={`absolute top-0 bottom-0 right-0 py-1 text-white rounded-r-lg shadow-lg transition-transform-opacity duration-300 ease-in-out opacity-0 pointer-events-none flex items-center justify-center bg-delete-btn hover:bg-delete-btn-hover`}
                            style={`width: ${swipeDistance}px;`}
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
        </div>

        <!-- "Add List" Button -->
        <div class="mt-4 flex justify-end">
            <button 
                class={`text-button-blue ${$darkMode ? 'hover:text-button-blue-hover-dark' : 'hover:text-button-blue-hover-light'} text-base`}
                on:click={toggleCreateForm}
                aria-label="Add new list"
            >
                Add List
            </button>
        </div>
    </div>

    {#if showCreateForm}
        <div class="fixed top-10 left-0 w-full h-screen z-50 flex items-start justify-center p-4">
            <div class={`bg-opacity-75 bg-black fixed inset-0 z-0`}></div>
            <div class={`relative z-10 p-6 border rounded-xl ${$darkMode ? 'border-border-dark bg-main-bg-dark' : 'border-border-light bg-main-bg-light'} max-w-md w-full`}>
                <div class="flex justify-between items-center mb-4">
                    <button 
                        on:click={toggleCreateForm} 
                        class={`text-sm text-button-blue ${$darkMode ? 'hover:text-button-blue-hover-dark' : 'hover:text-button-blue-hover-light'}`}
                        aria-label="Cancel"
                    >
                        Cancel
                    </button>
                    <h2 class="text-xl font-semibold">New List</h2>
                    <button 
                        on:click={handleCreateList}
                        class={`text-sm ${isDoneActive ? 'text-button-blue cursor-pointer ' + ($darkMode ? 'hover:text-button-blue-hover-dark' : 'hover:text-button-blue-hover-light') : 'text-button-disabled'}`}
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
                        class={`mt-2 block w-full p-3 border rounded-md ${$darkMode ? 'border-input-border-dark bg-input-bg-dark text-input-text-dark' : 'border-input-border-light'}`} 
                      />
                    </label>
                  
                    <label class="block">
                      Share with:
                      <div class="relative">
                        <select 
                          name="users" 
                          id="users"
                          bind:value={selectedUser} 
                          required
                          class={`mt-2 block w-full p-3 pr-12 border rounded-md appearance-none ${$darkMode ? 'border-input-border-dark bg-input-bg-dark text-input-text-dark' : 'border-input-border-light'}`} 
                        >
                            <option value="None">None</option>
                            {#each users as user}
                            <option value={user.id}>{user.username}</option>
                            {/each}
                        </select>
                  
                        <!-- Arrow Icon Container -->
                        <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg 
                            class="w-4 h-4 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              stroke-linecap="round" 
                              stroke-linejoin="round" 
                              stroke-width="2" 
                              d="M19 9l-7 7-7-7" 
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

<style lang="postcss">
    .revealed .list-content {
        @apply translate-reveal opacity-70;
    }
    
    .revealed button {
        @apply opacity-100 pointer-events-auto;
    }
    
    .unrevealed .list-content {
        @apply translate-x-0 opacity-100;
    }
    
    .unrevealed button {
        @apply opacity-0 pointer-events-none;
    }
    </style>
