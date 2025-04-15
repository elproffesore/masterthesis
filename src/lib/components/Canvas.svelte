<script>
    import { getStroke } from 'perfect-freehand';
    import { getSvgPathFromStroke } from '$lib/utils';
    import { docHeight, drawingVisibility, canvasVisibility } from '$lib/stores';
    import { onMount } from 'svelte';
    let points = $state([]);
    let pathsBuffer = $state([]);
    let paths = $state([]);
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
        console.log('move');

        if (e.buttons !== 1) return;
        points = [...points, [e.pageX, e.pageY, e.pressure]];
        

        let stroke = getStroke(points, {
            size: 3,
            thinning: 0.8,
            smoothing: 0.4,
            streamline: 0.6,
        });

        let pathData = getSvgPathFromStroke(stroke);
        pathsBuffer = [...pathsBuffer, pathData];
    }
    function handlePointerUp(e) {
        console.log('up');
        e.target.releasePointerCapture(e.pointerId);
        paths = [...paths,pathsBuffer[pathsBuffer.length - 1]];
        pathsBuffer = [];
        points = [];
    }
</script>
<svg id="drawing-canvas" class:hidden={!$canvasVisibility} class:pointer-events-none={!$drawingVisibility} class="w-[100vw] z-[1003] absolute top-0 left-0 transition-all duration-1000" style:height={$docHeight +'px'} height={$docHeight} onpointerdown="{handlePointerDown}" onpointermove="{handlePointerMove}" onpointerup="{handlePointerUp}">
    <g id="paths">
        {#each paths as pathData}
            <path d={pathData} stroke='%23111111' />
        {/each}
    </g>
    <g id="pathsBuffer">
        {#each pathsBuffer as pathData}
            <path d={pathData} stroke='%23111111' />
        {/each}
    </g>
    <g id="sessionStores"></g>
</svg>
