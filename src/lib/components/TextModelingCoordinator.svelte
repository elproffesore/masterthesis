<script>
    import { texts } from "$lib/stores";
    import TextModel from "$lib/components/TextModel.svelte";
    import { onMount } from "svelte";
</script>
<div class="w-full fixed">
    {#each $texts as _,i}
        <TextModel bind:textObject={$texts[i]} />
    {/each}
</div>