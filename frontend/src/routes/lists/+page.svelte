<script lang="ts">
    import { onMount } from 'svelte';
    import { getLists, createList, getUsers } from '../../lib/api';
    import type { ListResponseData, UserData} from '../../lib/types';
    import { goto } from '$app/navigation';
    import { darkMode } from '$lib/stores/darkModeStore'; // Import the shared dark mode store

    let lists: ListResponseData[] = [];
    let users: UserData[] = [];
    let newListName = '';
    let selectedUser = 'None';
    let sharedWith: number[] = [];
    let showCreateForm = false;

    const userId = localStorage.getItem('user_id');

    // Reactive statement to determine if the "Done" button should be active
    $: isDoneActive = newListName.trim() !== '';

    onMount(async () => {
        try {
            const fetchedLists = await getLists();
            if (fetchedLists) {
                lists = fetchedLists;
            } else {
                lists = []; // Initialize with an empty array if no data
            }
        } catch (error) {
            console.error('Failed to fetch lists:', error);
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

    listUsers().then(result => {
        users = result;
    });
</script>

<div class={$darkMode ? 'p-4 bg-main-bg-dark text-text-dark' : 'p-4 bg-main-bg-light text-text-light'}>
    <h1 class="text-3xl font-bold mb-6">My Lists</h1>

    <div class="flex flex-col">
        <div class="flex-grow">
            {#if lists.length > 0}
            <ul class="space-y-2">
                {#each lists as list (list.id)}
                    <li class={`flex rounded-xl shadow-ios transition-colors duration-200 ${$darkMode ? 'bg-lists-bg-dark hover:bg-lists-hover-dark' : 'bg-lists-bg-light hover:bg-lists-hover-light'}`}>
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
                                {#if list.shared_with.length > 0}
                                    <small class={`text-xs ${$darkMode ? 'text-list-shared-dark' : 'text-list-shared-light'}`}>Shared</small>
                                {/if}
                                <span class={`text-sm ${$darkMode ? 'text-list-item-count-dark' : 'text-list-item-count-light'}`}>{list.item_count}</span>
                                <span class="ri-arrow-right-s-line text-xl"></span>
                            </div>
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

    <!-- Create Form Modal -->
    {#if showCreateForm}
        <div class={`fixed inset-0 flex items-center justify-center z-50`}>
            <div class={`p-6 border rounded-xl ${$darkMode ? 'border-border-dark bg-main-bg-dark' : 'border-border-light bg-main-bg-light'} max-w-md w-full`}>
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
                            <option value="">None</option>
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
