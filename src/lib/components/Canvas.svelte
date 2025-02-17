<script>
    import { getStroke } from 'perfect-freehand';
    import { getSvgPathFromStroke } from '$lib/utils';
    import { docHeight, drawingVisibility } from '$lib/stores';

    let points = $state([]);
    let paths = $state([]);
    let innerHeight = $state(0);

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
            size: 5,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        });

        let pathData = getSvgPathFromStroke(stroke);
        paths = [...paths, pathData];
    }
</script>
<svg id="drawing-canvas" class:pointer-events-none={!$drawingVisibility} class="w-[100vw] z-[1003] absolute top-0 left-0 transition-all duration-1000" style:height={$docHeight+'px'}  onpointerdown="{handlePointerDown}" onpointermove="{handlePointerMove}">
    {#each paths as pathData}
        <path d={pathData} />
    {/each}
</svg>
