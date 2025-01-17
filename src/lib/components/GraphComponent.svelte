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
        relations.subscribe((value) => {
            updateGraph($textModels);
        });

        // wordRelations.subscribe(() => {
        //     let groupUpdate = svg.selectAll('.wordRelations').data($wordRelations);
        //     groupUpdate.exit().remove();
        //     let groupEnter = groupUpdate
        //         .enter()
        //         .append('g')
        //         .attr('class', '.wordRelations')
        //         .attr('id', (d) => '#wordRelations-' + d.id);

        //     groupEnter
        //         .append('text')
        //         .attr('fill', (d) => '#111111aa')
        //         .attr('font-size', (d) => `${15}px`)
        //         .attr('text-anchor', 'middle')
        //         .text((d) => d.type =="relation" ? d.id:" ");

        //     let update = groupEnter.selectAll('line').data((d) => d.relations);
        //     update.exit().remove();
        //     let enter = update.enter().append('line').attr('stroke', '#11111144').attr('stroke-width', 1).attr('opacity', 0.5);

        //     if (simulation == null) {
        //         console.log('simulation');
        //         simulation = d3
        //             .forceSimulation($wordRelations)
        //             .force('link', (d) => d3.forceLink(d.relations).id((d) => d.id).distance(30))
        //             .force('charge', d3.forceManyBody().strength(5))
        //             .alphaTarget(0.3)
        //             .on('tick', () => {
        //                 if(simulation.nodes().length == 0){
        //                     simulation.nodes($wordRelations);
        //                 }

        //                 simulation.force('link', (d) => d3.forceLink(d.relations).id((d) => d.id).distance(30))
        //                 groupEnter.merge(groupUpdate).style('transform', function (d, i) {
        //                     if(d.type == "relation"){
        //                         return `translate(${d.x}px,${d.y}px)`;
        //                     }else{
        //                         console.log(d);
        //                         d.fx = d.node.referenceNode.getBoundingClientRect().x + d.node.referenceNode.getBoundingClientRect().width / 2;
        //                         d.fy = d.node.referenceNode.getBoundingClientRect().y + d.node.referenceNode.getBoundingClientRect().height / 2;

        //                         return `translate(${d.fx}px,${d.fy}px)`;
        //                     }
        //                 });
        //                 // enter
        //                 //     .merge(update)
        //                 //     .attr('x1', (d) => 0)
        //                 //     .attr('y1', (d) => 0)
        //                 //     .attr('x2', (d) => 0)
        //                 //     .attr('y2', (d) => 0);
        //             });
        //     } else {
        //     }
        // });
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
