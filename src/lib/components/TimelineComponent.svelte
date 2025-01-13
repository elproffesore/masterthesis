<script>
    import { textModels } from '$lib/stores';
    import { relations, timelineVisibility } from '$lib/stores';
    import moment from 'moment';

    let timeStampsSorted = $state([]);
    let start = 0;
    let end = $derived(timeStampsSorted.length-1);
    let pointer = $state(0);
    let timelineElement;
    let pointerPosition = $state(0);
    function rescale(x) {
        let inMin = start;
        let inMax = end;
        let outMin = 0;
        let outMax = timelineElement?.getBoundingClientRect().width ?? 0;
        return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    function reverseRescale(x) {
        let inMin = 0;
        let inMax = timelineElement?.getBoundingClientRect().width ?? 0;
        let outMin = start;
        let outMax = end;
        if (x > inMax) {
            x = inMax;
        }
        if (x < inMin) {
            x = inMin;
        }
        return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    $effect(() => {
        // Handle empty relations
        if (!$relations || $relations.length === 0) {
            timeStampsSorted = [];
            return;
        }
        timeStampsSorted = $relations.map((relation) => relation.target.createdAt).sort((a, b) => a - b);
    });
    $effect(() => {
        if ($timelineVisibility) {
            $relations.map((relation, relationIndex) => {
                $textModels.find(t => t.id == relation.target.id).opacity = 0.05 + scalePointerPosition(relationIndex) * 0.95;
                relation.opacity = 0.05 + scalePointerPosition(relationIndex) * 0.95;
            });
        } else {
            $relations.map((relation) => {
                $textModels.find(t => t.id == relation.target.id).opacity = 1
                relation.opacity = 1;
            });
        }
    });
    function updateTimeLinePointer(e) {
        e.preventDefault();
        pointer = Math.round(reverseRescale(e.clientX - e.currentTarget.getBoundingClientRect().left));
        pointerPosition = timelineElement.children[pointer].getBoundingClientRect().left - timelineElement.getBoundingClientRect().left;
        $relations.map((relation, relationIndex) => {
                relation.target.opacity = 0.05 + scalePointerPosition(relationIndex) * 0.95;
                relation.opacity = 0.05 + scalePointerPosition(relationIndex) * 0.95;
            });
    }
    function scalePointerPosition(index) {
        let absDifference = index - pointer;
        let scale = 1 / ((Math.pow(absDifference, 2)*4) + 1);
        return scale;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="fixed bottom-4 w-3/4 left-[50%] translate-x-[-50%] flex items-end h-16"
    style:visibility={$timelineVisibility ? 'visible' : 'hidden'}
    onmousemove={updateTimeLinePointer}>
    <div bind:this={timelineElement} class="w-max flex items-end gap-2 z-1">
        {#each timeStampsSorted as timestamp, timestampIndex}
            <div class="w-px bg-black relative rounded" style="height: {10 + scalePointerPosition(timestampIndex) * 15}px;">
            </div>
        {/each}
    </div>
    <div
    class="absolute bottom-0 w-max pointer-events-none z-0"
    style:left={pointerPosition + 'px'}
    style:visibility={$timelineVisibility && timeStampsSorted.length > 0 ? 'visible' : 'hidden'}>
    <span class="relative text-[0.8rem] text-black left-[-50%] w-max pointer-events-none"
        >{moment(timeStampsSorted[Math.round(pointer)]).format('DD.MM. - HH:mm:ss')}</span>
    <div class="w-px h-12 bg-[#ff000066] rounded pointer-events-none"></div>
</div>
</div>

