<script>
    import { connectionsOpacity, graphVisibility, linkOpacity, text } from '$lib/stores';
    import { nodesVisibility } from '$lib/stores';
    import { textModels } from '$lib/stores';
    import { relations, timelineVisibility, connectionsVisibility } from '$lib/stores';
    import { getMostLeftNode, getMostRightNode, powScale } from '$lib/utils';
    import { onMount } from 'svelte';
    import Graph from './Graph.svelte';

    let canvas = null;
    let ctx = null;
    onMount(() => {
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth*2; // Adjust for high DPI screens
        canvas.height = window.innerHeight*2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(2, 2); // Adjust for high DPI screens
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        relations.subscribe((value) => {
            updateRelationsCanvas(value);
        });
        timelineVisibility.subscribe((value) => {
            $relations = [...$relations];
        });
        connectionsVisibility.subscribe((value) => {
            $relations = [...$relations];
        });
        requestAnimationFrame(render);
    });
    function updateRelationsCanvas(relations) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        relations.forEach((d) => {
            if (d.target.referenceNode == null || d.source.node == null) {
                d.target.referenceNode = document.querySelector('#textModel-' + d.target.id);
                return;
            }
            if(d.type != 'extracted' && !d.target.showRelatedWords){
                return
            }

            let textNode = d.source.node.getBoundingClientRect();
            let targetNode = d.target.referenceNode.getBoundingClientRect();

            let controlPoint1, controlPoint2, controlPoint3, controlPoint4;

            if (textNode.x < targetNode.x) {
                controlPoint1 = { x: textNode.x + textNode.width + 5, y: textNode.y + textNode.height / 2 };
                controlPoint2 = {
                    x: textNode.x + textNode.width + (targetNode.x - (textNode.x + textNode.width)) * 0.3,
                    y: textNode.y > targetNode.y ? textNode.y : textNode.y + textNode.height,
                };
                controlPoint3 = {
                    x: textNode.x + textNode.width + (targetNode.x - (textNode.x + textNode.width)) * 0.7,
                    y: targetNode.y > textNode.y ? targetNode.y : targetNode.y + targetNode.height / 2,
                };
                controlPoint4 = { x: targetNode.x - 5, y: targetNode.y + targetNode.height / 2 };
            } else {
                controlPoint1 = { x: textNode.x - 5, y: textNode.y + textNode.height / 2 };
                controlPoint2 = {
                    x: textNode.x - (textNode.x - (targetNode.x + targetNode.width)) * 0.3,
                    y: textNode.y > targetNode.y ? textNode.y : textNode.y + textNode.height,
                };
                controlPoint3 = {
                    x: textNode.x - (textNode.x - (targetNode.x + targetNode.width)) * 0.7,
                    y: targetNode.y > textNode.y ? targetNode.y : targetNode.y + targetNode.height / 2,
                };
                controlPoint4 = { x: targetNode.x + targetNode.width + 5, y: targetNode.y + targetNode.height / 2 };
            }

            ctx.beginPath();
            ctx.moveTo(controlPoint1.x, controlPoint1.y);
            ctx.bezierCurveTo(
                controlPoint2.x,
                controlPoint2.y,
                controlPoint3.x,
                controlPoint3.y,
                controlPoint4.x,
                controlPoint4.y
            );

            ctx.lineWidth = d.type === 'extracted' ? 2 : 1;
            ctx.setLineDash(d.type === 'extracted' ? [] : [5, 5]);
            ctx.strokeStyle = '#11111199';
            if($connectionsVisibility){
                if($timelineVisibility){
                    ctx.globalAlpha = d.opacity;
                }else{
                    if(d.type === 'extracted'){
                        ctx.globalAlpha = 0.7;
                    }else{  
                        ctx.globalAlpha = targetNode.y / textNode.y;
                    }
                }
            }else{
                ctx.globalAlpha = 0;
            }
            ctx.stroke();
        });
    }
    function render(){
        updateRelationsCanvas($relations);
        requestAnimationFrame(render);
    }
</script>
<canvas class="z-10 fixed pointer-events-none top-0 left-0" bind:this={canvas}> </canvas>

