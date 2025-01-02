<script>
    import { relations } from '$lib/stores';
    import { onMount } from 'svelte';

    let canvas;
    let ctx = $state(null);
    let visible = $state(true);

    function drawLines() {
        if (ctx != null && canvas && visible) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            $relations.forEach((relation) => {
                let textNode = relation.textNode;
                let modelNodeObject = relation.modelNode;
                let modelNode = modelNodeObject.htmlObject;
                let textPos = textNode.getBoundingClientRect();
                let modelPos = modelNode.getBoundingClientRect();
                ctx.strokeStyle = `rgba(0,0,0,${relation.relationSemanitcs.intensity})`;
                ctx.beginPath();
                ctx.moveTo(textPos.left + textPos.width + 15, textPos.top + textPos.height / 2);
                ctx.bezierCurveTo(
                    textPos.left + textPos.width + 100,
                    textPos.top + textPos.height / 2,
                    modelPos.left - 100,
                    modelPos.top + modelPos.height / 2,
                    modelPos.left - 15,
                    modelPos.top + modelPos.height / 2,
                );
                ctx.stroke();
            });
        }
        requestAnimationFrame(drawLines);
    }
    onMount(() => {
        window.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key == 'h') {
                e.preventDefault();
                visible = !visible;
            }
        });
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext('2d');
        requestAnimationFrame(drawLines);
    });

</script>
 <canvas bind:this={canvas} class="w-screen h-screen fixed pointer-events-none top-0 left-0 {visible?'block':'hidden'}"></canvas>