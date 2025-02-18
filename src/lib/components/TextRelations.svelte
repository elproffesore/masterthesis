<script>
    import { connectionsOpacity, graphVisibility, linkOpacity, text } from '$lib/stores';
    import { nodesVisibility } from '$lib/stores';
    import { textModels } from '$lib/stores';
    import { relations, timelineVisibility, connectionsVisibility } from '$lib/stores';
    import { getMostLeftNode, getMostRightNode, powScale } from '$lib/utils';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import Graph from './Graph.svelte';

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
            updateRelations(value);
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

        let relationLinesEnter = relationLinesUpdate.enter().append('path').attr('stroke', '#11111199').attr('fill', 'none');

        relationLinesEnter
            .merge(relationLinesUpdate)
            .attr('class', (d) => `relation relation-${d.target.id} relation-${d.type}`)
            .attr('d', (d) => {
                if (d.target.referenceNode == null || d.source.node == null) {
                    console.log(d.target)
                    return '';

                }
                let textNode = d.source.node.getBoundingClientRect();
                let targetNode = d.target.referenceNode.getBoundingClientRect();

                // Create four control points for the bezier curve
                let controlPoint1 = {};
                let controlPoint2 = {};
                let controlPoint3 = {};
                let controlPoint4 = {};

                if (textNode.x < targetNode.x) {
                    controlPoint1 = { x: textNode.x + textNode.width + 5, y: textNode.y + textNode.height / 2 };
                    controlPoint2 = {
                        x: textNode.x + textNode.width + (targetNode.x - (textNode.x + textNode.width)) * 0.2,
                        y: textNode.y + textNode.height / 2,
                    };
                    controlPoint3 = {
                        x: textNode.x + textNode.width + (targetNode.x - (textNode.x + textNode.width)) * 0.8,
                        y: targetNode.y + targetNode.height / 2,
                    };
                    controlPoint4 = { x: targetNode.x - 5, y: targetNode.y + targetNode.height / 2 };
                } else {
                    controlPoint1 = { x: textNode.x - 5, y: textNode.y + textNode.height / 2 };
                    controlPoint2 = {
                        x: textNode.x - (textNode.x - (targetNode.x + targetNode.width)) * 0.2,
                        y: textNode.y + textNode.height / 2,
                    };
                    controlPoint3 = {
                        x: textNode.x - (textNode.x - (targetNode.x + targetNode.width)) * 0.8,
                        y: targetNode.y + targetNode.height / 2,
                    };
                    controlPoint4 = { x: targetNode.x + targetNode.width + 5, y: targetNode.y + targetNode.height / 2 };
                }
                return line([controlPoint1, controlPoint2, controlPoint3, controlPoint4]);
            })
            .attr('marker-end', (d) => d.type == 'extracted'? 'url(#arrow)':'')
            .attr('marker-start', (d) => d.type != 'extracted'? 'url(#arrow)':'')
            .attr('stroke-width', (d) => (d.type == 'extracted' ? 2 : 1))
            .attr('opacity',(d) =>  d.opacity );
    }
</script>

<svg id="relations" class:hidden={!$nodesVisibility || $graphVisibility} class="w-[200vw] z-10 h-screen fixed pointer-events-none top-0 left-0 transition-all duration-1000">
    <defs>
        <!-- A marker to be used as an arrowhead -->
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
</svg>
