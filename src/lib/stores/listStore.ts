import { writable } from 'svelte/store';

export const currentListStore = writable({ name: '', id: '' });
