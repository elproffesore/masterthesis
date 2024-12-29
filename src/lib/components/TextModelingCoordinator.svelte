<script>
    import { texts } from "$lib/stores";
    import TextModel from "$lib/components/TextModel.svelte";
    import TextRelationsCoordinator from "$lib/components/TextRelationsCoordinator.svelte";
    import { onMount } from "svelte";
</script>
<div class="w-screen h-screen top-0 left-0 fixed pointer-events-none">
    <TextRelationsCoordinator />
</div>
<div class="w-full fixed">
    {#each $texts as _,i}
        <TextModel bind:textObject={$texts[i]} />
    {/each}
</div>