<script>
    import { graphVisibility, nodesVisibility, relations, textModels, wordRelations } from '$lib/stores';
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
        // relations.subscribe((value) => {
        //     updateGraph($textModels);
        // });
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
        wordRelations.subscribe((value) => {
            let groupUpdate = svg.selectAll('.wordRelations').data(value);
            groupUpdate.exit().remove();
            let groupEnter = groupUpdate
                .enter()
                .append('g')
                .attr('class', 'wordRelations')
                .attr('id', (d) => '#wordRelations-' + d.id);

            groupEnter
                .append('text')
                .attr('fill', (d) => (d.type == 'relation' ? '#ff1111aa' : 'none'))
                .attr('font-size', (d) => `${15}px`)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .text((d) => d.id);
            let relationsFlat = value.map((wordRelation) => wordRelation.relations).flat();
            let relationsFlatNodes = relationsFlat.map((wordRelation) => [wordRelation.source, wordRelation.target, wordRelation.score]);
            let linkUpdate = svg.selectAll('.link').data(relationsFlatNodes);
            linkUpdate.exit().remove();
            let linkEnter = linkUpdate
                .enter()
                .append('line')
                .attr('class', 'link')
                .attr('stroke', '#000000')

            if (simulation == null) {
                simulation = d3
                    .forceSimulation(value)
                    .force('charge', d3.forceManyBody().strength(-75))
                    .force('collide', d3.forceCollide().radius(30))
                    .alphaTarget(0.6)

            } 
                simulation.nodes(value);
                simulation
                    .force(
                        'link',
                        d3
                            .forceLink(relationsFlat)
                            .id((d) => d.id)
                            .distance(50),
                    )
                    .on('tick', () => {
                        // Update the position of the related words
                        let relationsFlat = value.map((wordRelation) => wordRelation.relations).flat();
                        let relationsFlatNodes = relationsFlat.map((wordRelation) => [wordRelation.source, wordRelation.target, wordRelation.score]);
                        linkUpdate = svg.selectAll('.link').data(relationsFlatNodes);
                        linkEnter
                            .merge(linkUpdate)
                            .attr('x1', (d) => {console.log(d[0].x) ;return d[0].x})
                            .attr('y1', (d) => d[0].y)
                            .attr('x2', (d) => d[1].x)
                            .attr('y2', (d) => d[1].y)
                            .attr('stroke-width', (d) => 1.5)
                            .attr('opacity', (d) => d[2]);
                        
                        groupEnter.merge(groupUpdate).style('transform', (d) => `translate(${d.x}px,${d.y}px)`);
                    });
            
        });
    });
    function updateGraph(textModels) {
        textModels.map((textModel, textModelIndex) => {
            if (!relatedWordsArray[textModelIndex]) {
                relatedWordsArray[textModelIndex] = textModel.relatedWords;
                svg.append('g').attr('id', `graph-${textModel.id}`);
            }
            if (relatedWordsArray[textModelIndex].length != textModel.relatedWords.length) {
                relatedWordsArray[textModelIndex] = textModel.relatedWords;
            }
            if (simulationArray[textModelIndex]) {
                simulationArray[textModelIndex].nodes = relatedWordsArray[textModelIndex];
                simulationArray[textModelIndex].restart();
            }
            // Create Text for each related word
            let graphtextUpdate = svg.select(`#graph-${textModel.id}`).selectAll('text').data(relatedWordsArray[textModelIndex]);

            graphtextUpdate.exit().remove();

            let graphtextEnter = graphtextUpdate
                .enter()
                .append('text')
                .attr('fill', (d) => d?.color ?? '#111111aa')
                .attr('font-size', (d) => `${15 + powScale(d.score, 3) * 30}px`)
                .attr('text-anchor', 'middle')
                .text((d) => d.word);

            // Create Links for each related word to the textModel
            // let graphLink = svg.select(`#graph-${textModel.id}`).selectAll('line').data(relatedWordsArray[textModelIndex]);
            // graphLink.exit().remove();
            // let graphLinkEnter = graphLink.enter().append('line').attr('stroke', '#11111144').attr('stroke-width', 1).attr('opacity', 0.5);

            // Create Simulation for each textModel
            if (!simulationArray[textModelIndex] && relatedWordsArray[textModelIndex].length > 0) {
                const simulation = d3.forceSimulation(relatedWordsArray[textModelIndex]).alphaTarget(0.6);

                simulation.on('tick', () => {
                    let textModelNode = document.querySelector(`#textModel-${textModel.id}`)?.getBoundingClientRect() ?? null;
                    // Update the position of the force according to the new position of the model
                    simulation
                        .force('radial', d3.forceRadial(100, textModelNode.left + textModelNode.width / 2, textModelNode.top + textModelNode.height / 2).strength(0.3))
                        .force('charge', d3.forceManyBody().strength(-40))
                        .force('collide', d3.forceCollide().radius(50))
                        .force('center', d3.forceCenter(textModelNode.left + textModelNode.width / 2, textModelNode.top + textModelNode.height / 2).strength(0.4));

                    // Update the position of the text and links
                    graphtextEnter.merge(graphtextUpdate).style('transform', function (d, i) {
                        return `translate(${d.x}px,${d.y}px)`;
                    });
                    // graphLinkEnter
                    //     .merge(graphLink)
                    //     .attr('x1', (d) => d.x)
                    //     .attr('y1', (d) => d.y)
                    //     .attr('x2', textModelNode.left + textModelNode.width / 2)
                    //     .attr('y2', textModelNode.top + textModelNode.height / 2);
                });

                simulationArray[textModelIndex] = simulation;
            }
        });
    }
</script>

<svg id="graph" class:hidden={!$nodesVisibility} class="w-[200vw] z-10 h-screen fixed pointer-events-none top-0 left-0 transition-all duration-1000"></svg>
