<script>
    import { connectionsOpacity, graphVisibility, text } from '$lib/stores';
    import { nodesVisibility } from '$lib/stores';
    import { textModels } from '$lib/stores';
    import { relations, timelineVisibility, connectionsVisibility } from '$lib/stores';
    import { getMostLeftNode, getMostRightNode, powScale } from '$lib/utils';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import GraphComponent from './GraphComponent.svelte';

    let svg = null;
    const line = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveCatmullRom.alpha(0.7));
    onMount(() => {
        svg = d3.select('#relations');
        window.addEventListener('scroll', () => {
            $relations = [...$relations];
        });
        relations.subscribe((value) => {
            updateRelations($relations);
        });
        timelineVisibility.subscribe((value) => {
            $relations = [...$relations];
        });
        connectionsVisibility.subscribe((value) => {
            $relations = [...$relations];
        });
    });

    function updateRelations(relations) {
        let relationLinesUpdate = svg.selectAll('.relation').data(relations);
        relationLinesUpdate.exit().remove();

        let relationLinesEnter = relationLinesUpdate.enter().append('path').attr('class', 'relation').attr('stroke', '#11111144').attr('fill', 'none');

        relationLinesEnter
            .merge(relationLinesUpdate)
            .attr('d', (d) => {
                if (d.target.referenceNode == null || d.source.nodes.length == 0) {
                    return '';
                }
                let rightNode = getMostRightNode(d.source.nodes).getBoundingClientRect();
                let targetNode = document.querySelector(`#textModel-${d.target.id} .markedText`).getBoundingClientRect();
                // Create four control points for the bezier curve
                let controlPoint1 = { x: rightNode.x + rightNode.width + 5, y: rightNode.y + rightNode.height / 2 };
                let controlPoint2 = {
                    x: rightNode.x + rightNode.width + (targetNode.x - (rightNode.x + rightNode.width)) * 0.1,
                    y: rightNode.y + rightNode.height / 2,
                };
                let controlPoint3 = {
                    x: rightNode.x + rightNode.width + (targetNode.x - (rightNode.x + rightNode.width)) * 0.9,
                    y: targetNode.y + targetNode.height / 2,
                };
                let controlPoint4 = { x: targetNode.x - 5, y: targetNode.y + targetNode.height / 2 };
                return line([controlPoint1, controlPoint2, controlPoint3, controlPoint4]);
            })
            .attr('stroke-width', (d) => ($connectionsVisibility ? 1.5 : 0))
            .attr('opacity', (d) => $timelineVisibility? d.opacity: 0.3);
    }
</script>

<svg id="relations" class:hidden={!$nodesVisibility || $graphVisibility} class="w-[200vw] z-10 h-screen fixed pointer-events-none top-0 left-0 transition-all duration-1000"></svg>
