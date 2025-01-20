<script>
    import { drawingFixedVisibility, drawingVisibility, markingType } from '$lib/stores';
    import { timelineVisibility, connectionsVisibility, nodesVisibility, graphVisibility, markingColor, textCollapse } from '$lib/stores';
    import { colors } from '$lib/utils';
    let optionsVisibility = $state(true);
    let colorVisibility = $state(true);
    let viewsVisibility = $state(true);
    let stylesVisibility = $state(true);
    let visualVisibility = $state(true);
</script>
<div class="flex gap-2 fixed items-start top-4 right-4 z-[110]">
    <div class="flex gap-2">
        <label for="options" class="font-bold">
            <input name="options" type="checkbox" bind:checked={optionsVisibility} />
            Options</label>
    </div>
    {#if optionsVisibility}
    <div id="views" class="flex flex-col gap-2 items-start">
        <label for="views" class="font-bold">
            <input name="views" type="checkbox"  bind:checked={viewsVisibility} />
            Views</label>
        {#if viewsVisibility}
        <div class="flex gap-2 ">
            <label for="timeline">
                <input name="timeline" type="checkbox" class="" bind:checked={$timelineVisibility} />
                Timeline</label>
        </div>
        <div class="flex gap-2 ">
            <label for="graph">
                <input name="graph" type="checkbox" class="" bind:checked={$graphVisibility} />
                Graph</label>
        </div>
        <div class="flex gap-2 ">
            <label for="drawing">
                <input name="drawing" type="checkbox" class="" bind:checked={$drawingVisibility} />
                Drawing</label>
        </div>
        {/if}
    </div>
    <div id="styles" class="flex flex-col gap-2 items-start">
        <label for="styles" class="font-bold">
            <input name="styles" type="checkbox"  bind:checked={stylesVisibility} />
            Styles</label>
            {#if stylesVisibility}


        <div class="flex gap-2 ">
            <label for="color">
                <input name="color" type="checkbox" class="" bind:checked={colorVisibility} />
                Color</label>
        </div>

        {#if colorVisibility}
            <div class="flex gap-2 ">
                {#each colors as color}
                    <div
                        class="w-4 h-4"
                        style:border={$markingColor == color ? '2px solid black' : 'none'}
                        style:background-color={color}
                        onclick={() => {
                            $markingColor = color;
                        }}>
                    </div>
                {/each}
            </div>
        {/if}
        <div class="flex flex-col gap-2">
            <label for="highlight">
                <input
                    id="highlight"
                    name="marking"
                    type="radio"
                    value="highlight"
                    class=""
                    checked
                    bind:group={$markingType} />
                Highlight</label>
            <label for="underline">
                <input
                    id="underline"
                    name="marking"
                    type="radio"
                    value="underline"
                    class=""
                    bind:group={$markingType} />
                Underline</label>
            <label for="wave">
                <input id="wave" name="marking" type="radio" value="wave" class="" bind:group={$markingType} />
                Wave</label>
        </div>

    {/if}
    </div>
    <div id="visual" class="flex flex-col gap-2 items-start">
        <label for="visual" class="font-bold">
            <input name="visual" type="checkbox"  bind:checked={visualVisibility} />
            Visual</label>
            {#if visualVisibility}
            <div class="flex gap-2 ">
                <label for="connections">
                    <input name="connections" type="checkbox" class="" bind:checked={$connectionsVisibility} />
                    Connections</label>
            </div>
            <div class="flex gap-2 ">
                <label for="nodes">
                    <input name="nodes" type="checkbox" class="" bind:checked={$nodesVisibility} />
                    Nodes</label>
            </div>
            <div class="flex gap-2 ">
                <label for="textCollapse">
                    <input name="textCollapse" type="checkbox" class="" bind:checked={$textCollapse} />
                    Text Collapse</label>
            </div>
            {/if}
    </div>
    {/if}
</div>