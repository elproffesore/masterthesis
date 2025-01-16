<script>
    import { connectionsOpacity, graphVisibility, text } from '$lib/stores';
    import { nodesVisibility } from '$lib/stores';
    import { textModels } from '$lib/stores';
    import { relations, timelineVisibility, connectionsVisibility } from '$lib/stores';
    import { getMostLeftNode, getMostRightNode, powScale } from '$lib/utils';
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    let svg = null;
    let simulationArray = [];
    let relatedWordsArray = [];
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
        graphVisibility.subscribe((value) => {
            // Animate the process between graph view and normal view
            let animation = setInterval(() => {
                $relations = $relations;
            }, 10);
            setTimeout(() => {
                clearInterval(animation);
            }, 1100);
            // Display Words after animation is over
            if (value) {
                updateGraph($textModels);
            } else {
                updateGraph([]);
            }
        });
        relations.subscribe((value) => {
            updateRelations(value);
            if ($graphVisibility) {
                updateGraph($textModels);
            }
        });
        timelineVisibility.subscribe((value) => {
            $relations = $relations;
        });
        connectionsVisibility.subscribe((value) => {
            $relations = $relations;
        });
    });

    function updateRelations(relations) {
        let relationLinesUpdate = svg.selectAll('.relation').data(relations);

        relationLinesUpdate.exit().remove();

        let relationLinesEnter = relationLinesUpdate
            .enter()
            .append('path')
            .attr('class', 'relation')
            .attr('stroke', '#11111144')
            .attr('fill', 'none');

        relationLinesEnter
            .merge(relationLinesUpdate)
            .attr('d', (d) => {
                if (d.target.referenceNode == null || d.source.nodes.length == 0) {
                    return '';
                }
                let rightNode = getMostRightNode(d.source.nodes).getBoundingClientRect();
                let targetNode = document
                    .querySelector(`#textModel-${d.target.id} .markedText`)
                    .getBoundingClientRect();
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
            .attr('stroke-width', (d) =>  $connectionsVisibility ? 1 : 0)
            .attr('opacity', (d) => d.opacity);
    }
    function updateGraph(textModels) {
        if(textModels.length === 0){
            svg.selectAll('g').remove();
            relatedWordsArray = [];
            simulationArray.map((simulation) => simulation.stop());
            simulationArray = [];
            return;
        }

        textModels.map((textModel, textModelIndex) => {
            console.log('Updating graph');
            if(!relatedWordsArray[textModelIndex]){
                relatedWordsArray[textModelIndex] = textModel.relatedWords;
            }
            let graphTextGroup = svg.selectAll(`#graph-${textModel.id}`).data([textModel]);
            graphTextGroup.exit().remove();
            let graphTextGroupEnter = graphTextGroup.enter().append('g').attr('id', `graph-${textModel.id}`);

            let graphtext = graphTextGroupEnter.selectAll('text').data(relatedWordsArray[textModelIndex]);
            graphtext.exit().remove();

            let graphtextEnter = graphtext
                .enter()
                .append('text')
                .attr('fill', (d) => d.length > 2 ?d[2]:'#111111aa')
                .attr('font-size', (d) => `${1+powScale(d[1],2)*40}px`)
                .text((d) => d[0]);
            
            let textModelNode = document.querySelector(`#textModel-${textModel.id}`)?.getBoundingClientRect() ?? null;

            // relatedWordsArray[textModelIndex].map((word, index) => {
            //     word.fx = textModel.x+40;
            //     word.fy = textModel.y+40;
            // });
            if(textModelNode == null){
                return;
            }
            if (!simulationArray[textModelIndex]) {
                const simulation = d3
                    .forceSimulation(relatedWordsArray[textModelIndex])
                    .alphaTarget(0.3)
                    .force("collide", d3.forceCollide().radius(50))
                    .force('charge', d3.forceManyBody().strength(-10))
                    .force('radial', d3.forceRadial(50, textModelNode.left+textModelNode.width/2, textModelNode.top+textModelNode.height/2).strength(0.1))

                simulation.on('tick', () => {
                    graphtextEnter.merge(graphtext).style('transform', function (d, i) {
                        return `translate(${d.x}px,${d.y}px)`;
                    });
                });
                simulationArray[textModelIndex] = simulation;
            }else{
                simulationArray[textModelIndex]
                .force('radial', d3.forceRadial(50, textModelNode.left+textModelNode.width/2, textModelNode.top+textModelNode.height/2).strength(0.1))
            }
        });
    }
</script>

<svg
    id="relations"
    class:hidden={!$nodesVisibility}
    bind:this={svg}
    class="w-[200vw] z-10 h-screen fixed pointer-events-none top-0 left-0 transition-all duration-1000"></svg>
