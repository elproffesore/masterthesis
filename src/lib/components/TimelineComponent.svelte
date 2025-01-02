<script>
    import { relations } from '$lib/stores';

    let timeStampsSorted = $state([])
    let start = $derived(timeStampsSorted[0]?? 0);
    let end = $derived(timeStampsSorted[timeStampsSorted.length - 1]?? 0);
    let pointer = $state(0);
    function rescale(x){
        let inMin = start;
        let inMax = end;
        let outMin = 0;
        let outMax = 300;
        return ((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
    }
    function reverseRescale(x){
        let inMin = 0;
        let inMax = 300;
        let outMin = start;
        let outMax = end;
        return ((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
    }
    $effect(() => {
    // Handle empty relations
    if (!$relations || $relations.length === 0) {
        timeStampsSorted = [];
        return;
    }

    timeStampsSorted = $relations.map(relation => relation.modelNode.createdAt).sort((a, b) => a - b);;

    // Set initial pointer if not set
    if (pointer === 0) {
        pointer = timeStampsSorted[0];
    }
});
function updateTimeLinePointer(e){
    e.preventDefault();
    pointer = reverseRescale(e.clientX-e.currentTarget.getBoundingClientRect().left);
}
function scalePointerPosition(timeStamp){
    let absDifference = Math.abs(timeStamp-pointer);
    let scale = 1 / ((Math.pow(absDifference,2)/60000)+1);
    return scale;
}
</script>

<div class="fixed bottom-8 left-[50%] translate-x-[-50%] h-[40px] w-[300px]" onmousemove={updateTimeLinePointer}>
    {#each timeStampsSorted as timeStamp}
        <div class="w-[1px] bg-black absolute h-[10px] top-[50%] translate-y-[-50%]" style="transform: scale(1,{1 + scalePointerPosition(timeStamp) * 1})" style:left={rescale(timeStamp)+"px"}></div>

    {/each}
    {#if timeStampsSorted.length > 0}
        <div class="w-[1px] h-8  absolute bg-[#ff0000] top-[50%] translate-y-[-50%]" style:left={rescale(pointer)+"px"} ></div>
    {/if}
</div>