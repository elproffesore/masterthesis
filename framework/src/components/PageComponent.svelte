<script>
    import LayerComponent from "./LayerComponent.svelte";
    import PosLayerComponent from "./PosLayerComponent.svelte";
    import { nameShortener } from "$lib/helpers";

    export let text;
    export let page;

    let iterations = [];
    let activeLayer = 0;
    let highlight = null;
    let tagSet = [];
</script>

<div class="grid grid-cols-12 mt-8 w-[700px]">
    <div class="col-span-4 flex flex-col gap-4" id="iterations">
        <h2 class="font-bold">Iterations</h2>
        <div id="iteration-buttons" class=" flex flex-col gap-4">
            {#each iterations as iteration, index}
                <button
                    class="border text-left rounded-md px-2 py-px hover:border-r-8 {activeLayer ==
                    index
                        ? 'border-r-8 border-r-[#00ff00]'
                        : ''}"
                    on:click={() => {
                        activeLayer = index;
                    }}>{nameShortener(iteration.name)}</button
                >
            {/each}
        </div>
        <button
            class="text-center border rounded-md pr-2 hover:bg-[#00ff00aa]"
            on:click={() => {
                iterations.push({name: 'Iteration'+iterations.length})
                iterations = iterations
            }}>+</button
        >
        <h2 class="font-bold">Tags</h2>
        <div class="flex flex-wrap gap-2">
            {#each tagSet as tag}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="w-min text-left border rounded-md px-2 py-px cursor-pointer hover:border-[#00ff00aa]"
                    on:focus={() => {}}
                    on:mouseover={() => (highlight = tag)}
                    on:mouseleave={() => (highlight = null)}
                >
                    {tag}
                </div>
            {/each}
        </div>
    </div>
    <div class="col-start-5 col-span-5 ml-16 h-min flex flex-col gap-4">
        <div id="wrapper{page}" class="w-full text-justify">
            <PosLayerComponent {text} bind:tagSet {highlight} />
            {#each iterations as iteration, index}
                <LayerComponent bind:iteration={iteration} {text} {index} active={activeLayer == index} />
            {/each}
        </div>
    </div>
</div>
