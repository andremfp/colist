<!-- src/routes/lists/[slug]/+page.svelte -->

<script lang="ts">
    import { onMount } from 'svelte';
    import { getListDetails } from '../../../lib/api';
    import type { ListData } from '../../../lib/types';
    import { page } from '$app/stores';

    let list: ListData | null = null;
    let error = '';

    // Use $page store to get the id parameter from the URL
    $: id = $page.params.id;

    onMount(async () => {
        try {
            list = await getListDetails(parseInt(id));
        } catch (err) {
            error = 'Failed to fetch list details';
            console.error(err);
        }
    });
</script>

{#if error}
    <p>{error}</p>
{:else if list}
    <div>
        <h1>{list.name}</h1>
    </div>
{:else}
    <p>Loading...</p>
{/if}
