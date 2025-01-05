<script>
    import { timelineVisibility, connectionsVisibility, markingColor } from '$lib/stores';
    import { colors } from '$lib/utils';
    let optionsVisibility = $state(true);
</script>
<div class="flex flex-col gap-2 fixed items-end bottom-4 right-4">
    <div class="flex gap-2 mb-4">
        <label for="options">Options</label>
        <input name="options" type="checkbox"  bind:checked={optionsVisibility}/>
    </div>
    {#if optionsVisibility}
    <div class="flex gap-2">
        <label for="timeline">Timeline</label>
        <input name="timeline" type="checkbox" class="" bind:checked={$timelineVisibility}/>

    </div>
    <div class="flex gap-2">
        <label for="connections">Connections</label>
        <input name="connections" type="checkbox" class="" bind:checked={$connectionsVisibility} />
    </div>
    <div class="flex gap-2 items-center">
        <label for="color">Color</label>
        <div class="flex flex-col gap-2">
            {#each colors as color}
            <div class="w-4 h-4" style:border={$markingColor == color?'2px solid black':'none'} style:background-color={color} onclick={() => {$markingColor = color;}}></div>
            {/each}
        </div>

    </div>
    {/if}
</div>