<script>
    import { relations } from '$lib/stores';
    import { getMostLeftNode, getMostRightNode } from '$lib/utils';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    let svg = null;
    const line = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveCatmullRom.alpha(0.9));

    onMount(() => {
        svg = d3.select('#relations');
        window.addEventListener('scroll', () => {
            $relations = $relations;
        });
    });


    $effect(() => {
        console.log('Relations updated');
        let relationLinesUpdate = svg.selectAll('.relation').data($relations);
        
        relationLinesUpdate.exit().remove();
        
        let relationLinesEnter = relationLinesUpdate
            .enter()
            .append('path')
            .attr('class', 'relation')
            .attr('d', (d) => {
                let leftNode = getMostLeftNode(d.source.nodes).getBoundingClientRect();
                let rightNode = getMostRightNode(d.source.nodes).getBoundingClientRect();
                let targetNode = d.target.referenceNode.getBoundingClientRect();

                // Check which node is closer to the source node
                let leftDistance = Math.abs(leftNode.x - targetNode.x);
                let rightDistance = Math.abs(rightNode.x - targetNode.x);
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
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

        relationLinesEnter.merge(relationLinesUpdate).attr('d', (d) => {
            let leftNode = getMostLeftNode(d.source.nodes).getBoundingClientRect();
                let rightNode = getMostRightNode(d.source.nodes).getBoundingClientRect();
                let targetNode = d.target.referenceNode.getBoundingClientRect();

                // Check which node is closer to the source node
                let leftDistance = Math.abs(leftNode.x - targetNode.x);
                let rightDistance = Math.abs(rightNode.x - targetNode.x);
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
        });
    });
</script>

<svg
    id="relations"
    bind:this={svg}
    class="w-screen h-full fixed pointer-events-none top-0 left-0"
></svg>
