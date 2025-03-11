<script>
    import { getStroke } from 'perfect-freehand';
    import { getSvgPathFromStroke } from '$lib/utils';
    import { docHeight, drawingVisibility } from '$lib/stores';
    import { onMount } from 'svelte';

    let points = $state([]);
    let paths = $state([]);
    let innerHeight = $state(0);
    onMount(() => {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'd') {
                $drawingVisibility = true
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'd') {
                $drawingVisibility = false
            }
        });
    });
     
    function handlePointerDown(e) {
        console.log('down');
        e.target.setPointerCapture(e.pointerId);
        points = [[e.pageX, e.pageY, e.pressure]]
    }

    function handlePointerMove(e) {
        console.log('down');

        if (e.buttons !== 1) return;
        points = [...points, [e.pageX, e.pageY, e.pressure]];
        

        let stroke = getStroke(points, {
            size: 2,
            thinning: 0.2,
            smoothing: 0.8,
            streamline: 0.8,
        });

        let pathData = getSvgPathFromStroke(stroke);
        paths = [...paths, pathData];
    }
    function handlePointerUp(e) {
        console.log('up');
        e.target.releasePointerCapture(e.pointerId);
        points = [];
    }
</script>
<svg id="drawing-canvas" class:pointer-events-none={!$drawingVisibility} class="w-[100vw] z-[1003] absolute top-0 left-0 transition-all duration-1000" style:height={$docHeight +'px'} height={$docHeight} onpointerdown="{handlePointerDown}" onpointermove="{handlePointerMove}" onpointerup="{handlePointerUp}">
    {#each paths as pathData}
        <path d={pathData} stroke='%23111111' />
    {/each}
    <g id="sessionStores"></g>
</svg>
