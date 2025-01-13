<script>
    import { relations, models, connectionsVisibility, textModels, graphVisibility, simulation } from '$lib/stores';
    import { getBoundingClientOfNodeGroup } from '$lib/utils';
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
    onMount(() => {
        $simulation = d3.forceSimulation();
        $simulation.stop();
        $simulation.alpha(1)
        $simulation.nodes($textModels);
        $simulation.force('body', d3.forceManyBody().strength(5));
        $simulation.force('collide', d3.forceCollide(30));
        //$simulation.force('link', d3.forceLink($relations).id((d,i) => d.id).distance(10));
        $simulation.on('tick',() => {
            $relations = $relations
            $textModels =  $textModels
        })
    });
    $effect(() => {
        if (document) {
            if ($graphVisibility) {
                $simulation.alpha(1).restart();
                document
                    .querySelectorAll('#textWrapper span:not(.selected)')
                    .forEach((e) => (e.style.display = 'none'));
            } else {
                $simulation.stop();
                document.querySelectorAll('#textWrapper span').forEach((e) => (e.style.display = 'inline'));
            }
        }
    });
    $effect(() => {
        if ($connectionsVisibility) {
            svg.style('display', 'block');
        } else {
            svg.style('display', 'none');
        }
    });
    $effect(() => {
        if ($graphVisibility) {
        } 
        //purely for reactivity
        let relationLinesUpdate = svg.selectAll('.relation').data($relations);

        relationLinesUpdate.exit().remove();

        let relationLinesEnter = relationLinesUpdate
            .enter()
            .append('path')
            .attr('class', 'relation')
            .attr('stroke', '#00000044')
            .attr('stroke-width', 1)
            .attr('fill', 'none');

        relationLinesEnter.merge(relationLinesUpdate).attr('d', (d) => {
            let source = $textModels.find((model) => model.id == d.source);
            let target = $textModels.find((model) => model.id == d.target);
            if(source != undefined && target != undefined && source.referenceNodes.length > 0 && target.referenceNodes.length > 0){
                let sourceCenter = getBoundingClientOfNodeGroup(source.referenceNodes).center
                let targetCenter = getBoundingClientOfNodeGroup(target.referenceNodes).center
                return line([sourceCenter, targetCenter]);
            }
        });
    });
</script>

<svg id="relations" bind:this={svg} class="w-screen h-full fixed pointer-events-none top-0 left-0"></svg>
