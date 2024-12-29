<script>
    import { texts } from "$lib/stores";
    import TextModel from "$lib/components/TextModel.svelte";

</script>
<div class="w-full fixed">
    {#each $texts as textObject}
        <TextModel bind:textObject={textObject} />
    {/each}
</div>
