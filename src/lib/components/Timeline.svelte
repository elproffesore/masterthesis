<script>
    import { paths, relations, textModels, timelineVisibility } from '$lib/stores';
    import moment from 'moment';
    import { onMount } from 'svelte';

    let timeStampsSorted = $state([]);
    let start = 0;
    let end = $derived(timeStampsSorted.length - 1);
    let pointer = $state(0);
    let timelineElement;
    let pointerPosition = $state(0);
    onMount(() => {
        textModels.subscribe((value) => {
            updateTimestamps();
        });
        paths.subscribe((value) => {
            updateTimestamps();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 't') {
                $timelineVisibility = true;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 't') {
                $timelineVisibility = false;
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
        pointerPosition = timelineElement.children[pointer].getBoundingClientRect().left - timelineElement.getBoundingClientRect().left;
        updateOpacities();
    }
    function scalePointerPosition(index) {
        let absDifference = Math.abs(index - pointer);
        let scale = 1 / (Math.pow(absDifference, 8) + 1);
        return scale;
    }
    function updateOpacities() {
        let elements = [...$textModels, ...$paths].sort((a, b) => a.changedAt - b.changedAt);
        elements.map((element, elementIndex) => {
            let opacity = 0.05 + scalePointerPosition(elementIndex) * 0.95;
            if (element.id == undefined) {
                element.opacity = opacity;
            } else {
                element.timelineOpacity = opacity;
                $relations
                    .filter((relation) => relation.target.id == element.id)
                    .map((relation) => {
                        relation.opacity = opacity;
                    });
            }
        });
        $textModels = [...$textModels];
        $relations = [...$relations];
        $paths = [...$paths];
    }
    function updateTimestamps() {
        timeStampsSorted = [...$textModels.map((model) => model.changedAt).sort((a, b) => a - b), ...$paths.map((model) => model.changedAt).sort((a, b) => a - b)];
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed bottom-px w-full left-[5%] flex items-end h-8 bg-[#fffff4] z-[1002]" style:visibility={$timelineVisibility ? 'visible' : 'hidden'} style="box-shadow: 0 0px 10px 10px #fffff4;" onmousemove={updateTimeLinePointer}>
    <div bind:this={timelineElement} class="w-max flex items-end gap-2 z-1">
        {#each timeStampsSorted as timestamp, timestampIndex}
            <div class="w-px bg-black relative rounded" style="height: {10 + scalePointerPosition(timestampIndex) * 15}px;"></div>
        {/each}
    </div>
    <div class="absolute bottom-0 w-max pointer-events-none z-0" style:left={pointerPosition + 'px'} style:visibility={$timelineVisibility && timeStampsSorted.length > 0 ? 'visible' : 'hidden'}>
        <span class="relative text-[0.8rem] text-black left-[-50%] w-max pointer-events-none">{moment(timeStampsSorted[Math.round(pointer)]).format('DD.MM. - HH:mm:ss')}</span>
        <div class="w-px h-12 bg-[#ff000066] rounded pointer-events-none"></div>
    </div>
</div>
