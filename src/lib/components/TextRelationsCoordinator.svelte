<script>
    import { nodesVisibility } from '$lib/stores';
    import { relations,timelineVisibility,connectionsVisibility } from '$lib/stores';
    import { getMostLeftNode, getMostRightNode } from '$lib/utils';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    let svg = null;
    const line = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveCatmullRom.alpha(0.7));

    onMount(() => {
        svg = d3.select('#relations');
        window.addEventListener('scroll', () => {
            $relations = $relations;
        });
    });


    $effect(() => {
        if($timelineVisibility){}
        if($connectionsVisibility){}
        let relationLinesUpdate = svg.selectAll('.relation').data($relations);
        
        relationLinesUpdate.exit().remove();
        
        let relationLinesEnter = relationLinesUpdate
            .enter()
            .append('path')
            .attr('class', 'relation')
            .attr('stroke', '#11111144')
            .attr('fill', 'none')


        relationLinesEnter.merge(relationLinesUpdate)
        .attr('d', (d) => {
            if(d.target.referenceNode == null || d.source.nodes.length == 0){
                return '';
            }
                let leftNode = getMostLeftNode(d.source.nodes).getBoundingClientRect();
                let rightNode = getMostRightNode(d.source.nodes).getBoundingClientRect();
                let targetNode = document.querySelector(`#textModel-${d.target.id} .markedText`).getBoundingClientRect();
                // Check which node is closer to the source node
                let leftDistance = Math.abs(leftNode.x - targetNode.x + targetNode.width);
                let rightDistance = Math.abs(rightNode.x + rightNode.width - targetNode.x);
                let closestNode = leftDistance < rightDistance ? leftNode : rightNode;
                // Create four control points for the bezier curve
                let controlPoint1 = {}
                let controlPoint2 = {}
                let controlPoint3 = {}
                let controlPoint4 = {}
                if(leftDistance < rightDistance){
                    controlPoint1 = { x: leftNode.x - 5, y: leftNode.y + leftNode.height / 2 };
                    controlPoint2 = { x: leftNode.x - (leftNode.x - (targetNode.x+targetNode.width)) * 0.1, y: leftNode.y + leftNode.height / 2 };
                    controlPoint3 = { x: leftNode.x - (leftNode.x - (targetNode.x+targetNode.width)) * 0.9, y: targetNode.y + targetNode.height / 2 };
                    controlPoint4 = { x: targetNode.x + targetNode.width + 5, y: targetNode.y + targetNode.height / 2};
                }else{
                    controlPoint1 = { x: rightNode.x + rightNode.width + 5, y: rightNode.y + rightNode.height / 2 };
                    controlPoint2 = { x: rightNode.x + rightNode.width + (targetNode.x - (rightNode.x + rightNode.width)) * 0.1, y: rightNode.y + rightNode.height / 2 };
                    controlPoint3 = { x: rightNode.x + rightNode.width + (targetNode.x - (rightNode.x + rightNode.width)) * 0.9, y: targetNode.y + targetNode.height / 2 };
                    controlPoint4 = { x: targetNode.x - 5, y: targetNode.y + targetNode.height / 2};
                }
                
                return line([controlPoint1, controlPoint2, controlPoint3, controlPoint4]);
        })
        .attr('stroke-width', $connectionsVisibility ? 1.5 : 0)
        .attr('opacity', (d) => $timelineVisibility ? d.opacity: 0.5); 

    });
</script>

<svg
    id="relations"
    class:hidden={!$nodesVisibility}
    bind:this={svg}
    class="w-screen h-screen fixed pointer-events-none top-0 left-0"
></svg>
