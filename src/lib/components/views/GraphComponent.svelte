<script>
    import { graphVisibility, nodesVisibility, relations, textModels, timelineVisibility, wordRelations } from '$lib/stores';
    import { powScale } from '$lib/utils';
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { text } from '@sveltejs/kit';
    let svg = null;
    let simulation = null;
    let simulationArray = [];
    let relatedWordsArray = [];
    onMount(() => {
        svg = d3.select('#graph');
        relations.subscribe(() => {
            $wordRelations
                .filter((relation) => relation.type == 'root')
                .map((relation) => {
                    let node = relation.node.referenceNode;
                    if (node) {
                        let boundingClientRect = node.getBoundingClientRect();
                        relation.fx = boundingClientRect.x + boundingClientRect.width / 2;
                        relation.fy = boundingClientRect.y + boundingClientRect.height / 2;
                        relation.x = relation.fx;
                        relation.y = relation.fy;
                    }
                });
        });
        nodesVisibility.subscribe((value) => {
           $wordRelations = [...$wordRelations];
        });
        wordRelations.subscribe((value) => {
            updateGraph(value)
        });
        function updateGraph(value){
            let valueFiltered = value.filter((wordRelation) => wordRelation.relations.length > 1 || wordRelation.type == 'root')
            let groupUpdate = svg.selectAll('.wordRelations').data(valueFiltered);
            groupUpdate.exit().remove();
            let groupEnter = groupUpdate
                .enter()
                .append('text')
                .attr('class', 'wordRelations')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')




            let relationsFlat = valueFiltered.map((wordRelation) => wordRelation.relations).flat()
            let relationsFlatNodes = relationsFlat.map((wordRelation) => [wordRelation.source, wordRelation.target, wordRelation.score]);
            let linkUpdate = svg.selectAll('.link').data(relationsFlatNodes);
            linkUpdate.exit().remove();
            let linkEnter = linkUpdate
                .enter()
                .append('line')
                .attr('class', 'link')
                .attr('stroke-width', (d) => 1)
                .attr('stroke', '#000000')

            if (simulation == null) {
                simulation = d3
                    .forceSimulation(valueFiltered)
                    .force('collide', d3.forceCollide().radius(50))
                    
                    .alphaTarget(0.3)

            } 
                simulation.nodes(valueFiltered);
                simulation
                    .force(
                        'link',
                        d3
                            .forceLink(relationsFlat)
                            .id((d) => d.id)
                            .distance(30),
                    )
                    .on('tick', () => {
                        // Update the position of the related words
                        let relationsFlat = valueFiltered.map((wordRelation) => wordRelation.relations).flat()
                        let relationsFlatNodes = relationsFlat.map((wordRelation) => [wordRelation.source, wordRelation.target, wordRelation.score]);
                        linkUpdate = svg.selectAll('.link').data(relationsFlatNodes);
                        linkEnter
                            .merge(linkUpdate)
                            .attr('x1', (d) => d[0].x)
                            .attr('y1', (d) => d[0].y)
                            .attr('x2', (d) => d[1].x)
                            .attr('y2', (d) => d[1].y)
                            .attr('opacity', (d) => powScale(d[2],10));
                        
                        groupEnter.merge(groupUpdate)
                        .style('transform', (d) => `translate(${d.x}px,${d.y}px)`)
                        .attr('font-size', (d) => {
                            if(d.relations.length == 0){
                                return '0px'
                            }else{
                                let max = d.relations.map(d => {
                                    if(d.score != NaN){
                                        return d.score
                                    }else{
                                        return 0
                                    }
                                });
                                max = max.reduce((acc, num) => acc+num, 0)/d.relations.length;
                                return`${powScale(max,3 )*45}px`
                            }
                        })
                        .attr('fill', (d) => d.type == 'relation' ? '#ff1111' : 'none')
                        .text((d) => d.id);
                    });
        }
    });
</script>

<svg id="graph" class:hidden={!$graphVisibility} class="w-[200vw] z-10 h-screen fixed pointer-events-none top-0 left-0 transition-all duration-1000"></svg>
