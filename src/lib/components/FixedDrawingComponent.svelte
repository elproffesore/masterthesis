<script>
    import { getStroke } from 'perfect-freehand';
    import { getSvgPathFromStroke } from '$lib/utils';
    import { docHeight, drawingFixedVisibility, drawingVisibility } from '$lib/stores';

    let points = $state([]);
    let paths = $state([]);
    let innerHeight = $state(0);

    function handlePointerDown(e) {
        console.log('down');
        e.target.setPointerCapture(e.pointerId);
        points = [[e.pageX, e.pageY-window.scrollY, e.pressure]]
    }

    function handlePointerMove(e) {
        console.log('down');

        if (e.buttons !== 1) return;
        points = [...points, [e.pageX, e.pageY-window.scrollY, e.pressure]];
        

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
<svg id="drawing-canvas-fixed" class:pointer-events-none={!$drawingFixedVisibility} class="w-[100vw] h-full z-[100] fixed top-0 left-0 transition-all duration-1000"  onpointerdown="{handlePointerDown}" onpointermove="{handlePointerMove}"> <!-- style:height={$docHeight+'px'} position absolute -->
    {#each paths as pathData}
        <path d={pathData} />
    {/each}
</svg>
