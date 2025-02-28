<script>
    import { relations,textModels, timelineVisibility } from '$lib/stores';
    import moment from 'moment';
    import { onMount } from 'svelte';

    let timeStampsSorted = $state([]);
    let start = 0;
    let end = $derived(timeStampsSorted.length - 1);
    let pointer = $state(0);
    let timelineElement;
    let pointerPosition = $state(0);
    onMount(() => {
        relations.subscribe(() => {
            timeStampsSorted = $relations.map((relation) => relation.target.createdAt).sort((a, b) => a - b);
        });
        timelineVisibility.subscribe((value) => {
            if (!value) {
                $relations.map((relation) => {
                    $textModels.find((t) => t.id == relation.target.id).opacity = 1;
                    relation.opacity = 1;
                });
            } else {
                timeStampsSorted = $relations.map((relation) => relation.target.createdAt).sort((a, b) => a - b);
                updateOpacities()
            }
        });
    });
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
    function updateTimeLinePointer(e) {
        e.preventDefault();
        pointer = Math.round(reverseRescale(e.clientX - e.currentTarget.getBoundingClientRect().left));
        pointerPosition =
            timelineElement.children[pointer].getBoundingClientRect().left -
            timelineElement.getBoundingClientRect().left;
        updateOpacities()
    }
    function scalePointerPosition(index) {
        let absDifference = index - pointer;
        let scale = 1 / (Math.pow(absDifference, 2) + 1);
        return scale;
    }
    function updateOpacities(){
        let relationScores = {};
        $relations.map((relation, relationIndex) => {
            relationScores[relation.target.id] = Math.max(relationScores[relation.target.id] || 0, 0.1 + scalePointerPosition(relationIndex) * 0.9);
            relation.opacity = 0.1 + scalePointerPosition(relationIndex) * 0.9;
        });
        Object.keys(relationScores).map((key) => {
            $textModels.find((t) => t.id == key).opacity = relationScores[key];
        });
        $textModels = [...$textModels];
        $relations = [...$relations];
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="fixed bottom-px w-full left-[5%] flex items-end h-8 bg-[#fffff8] z-[1002]"
    style:visibility={$timelineVisibility ? 'visible' : 'hidden'}
    style="box-shadow: 0 0px 10px 10px #fffff8;"
    onmousemove={updateTimeLinePointer}>
    <div bind:this={timelineElement} class="w-max flex items-end gap-2 z-1">
        {#each timeStampsSorted as timestamp, timestampIndex}
            <div
                class="w-px bg-black relative rounded"
                style="height: {10 + scalePointerPosition(timestampIndex) * 15}px;">
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
