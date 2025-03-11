<script>
    import { drawingFixedVisibility, drawingVisibility, linkOpacity, markingType, relations } from '$lib/stores';
    import { timelineVisibility, connectionsVisibility, nodesVisibility, graphVisibility, markingColor, textCollapse } from '$lib/stores';
    import { colors } from '$lib/utils';
    let optionsVisibility = $state(true);
    let colorVisibility = $state(true);
    let layersVisibility = $state(true);
    let stylesVisibility = $state(false);
    let visualVisibility = $state(true);
</script>
<div class="flex gap-2 fixed items-start top-4 right-4 z-[1005]">
    {#if optionsVisibility}
    <div id="views" class="flex flex-col gap-2 items-start">
        <label for="views" class="font-bold">
            <input name="views" type="checkbox"  bind:checked={layersVisibility} />
            Layers</label>
        {#if layersVisibility}
        <div class="flex gap-2 ">
            <label for="timeline">
                <input name="timeline" type="checkbox" class="" bind:checked={$timelineVisibility} />
                Timeline (t)</label>
        </div>
        <div class="flex gap-2 ">
            <label for="graph">
                <input name="graph" type="checkbox" class="" bind:checked={$graphVisibility} />
                Graph (g)</label>
        </div>
        <div class="flex gap-2 ">
            <label for="drawing">
                <input name="drawing" type="checkbox" class="" bind:checked={$drawingVisibility} />
                Drawing (d)</label>
        </div>
        {/if}
    </div>
    <div id="visual" class="flex flex-col gap-2 items-start">
        <label for="visual" class="font-bold">
            <input name="visual" type="checkbox" bind:checked={visualVisibility} />
            Visual</label>
            {#if visualVisibility}
            <div class="flex gap-2 ">
                <label for="nodes">
                    <input name="nodes" type="checkbox" class="" bind:checked={$nodesVisibility} />
                    Nodes</label>
            </div>
            {/if}
    </div>
    {/if}
</div>