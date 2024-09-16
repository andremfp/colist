<script lang="ts">
	import { fly } from 'svelte/transition';
	import { navigationDirection } from './stores/navigationStore';
	export let key;
	export let duration;

	$: direction = $navigationDirection === 'forward' ? 1 : -1;
</script>

{#key key}
	<div
		in:fly={{ x: 200 * direction, duration, delay: duration }}
		out:fly={{ x: -200 * direction, duration }}
	>
		<slot />
	</div>
{/key}
