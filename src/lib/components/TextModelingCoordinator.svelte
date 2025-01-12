<script>
    import { textModels, relations, markingColor, graphVisibility } from '$lib/stores';
    import { getMostRightNode, findSpanParentRecursive, opacityRegex, getMostLeftNode } from '$lib/utils';
    import TextModel from '$lib/components/TextModel.svelte';
    import TextRelationsCoordinator from '$lib/components/TextRelationsCoordinator.svelte';
    import { onMount } from 'svelte';
    import rangy from 'rangy';
    import TimelineComponent from './TimelineComponent.svelte';
    import LayerOptions from './LayerOptions.svelte';
    import * as d3 from 'd3'
    import { v4 as uuidv4 } from 'uuid';
    onMount(() => {
        window.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('textElement') || e.target.parentNode.classList.contains('textElement')) {
                let text = '';
                // Filter through the nodes to get only the raw parents
                let nodesRaw = rangy.getSelection()._ranges[0].getNodes();
                let nodesTexts = nodesRaw.filter((node) => node.nodeName == '#text');
                let nodes = nodesTexts.map((node) => findSpanParentRecursive(node)).filter((node) => node != null);
                nodes.map((node) => {
                    // Set the background color of the selected word to a light purple
                    const opacity = window.getComputedStyle(node).backgroundColor.match(opacityRegex)[1]; // Returns "0.5"
                    let colors = Array.from($markingColor.matchAll(/\d+/g));
                    node.style.backgroundColor = `rgba(${colors[0]},${colors[1]},${colors[2]},${Number(opacity) + 0.2})`;
                    text += node.innerText + ' ';
                    node.classList.add('selected');
                });

                if (nodes.length > 0) {
                    let node = nodes[0].getBoundingClientRect();
                    // Create a logical node with all the information about the selection
                    let textModelNode = {
                        text,
                        index: uuidv4(),
                        type: 'comment', // can be text, comment or drawing
                        x: 100,
                        y: 100,
                        vx: 0,
                        vy: 0,
                        textReferenceNodes: nodes,
                        referenceNodes: [],
                        createdAt: new Date().getTime(),
                        changedAt: new Date().getTime(),
                    };
                    // Push this node into the texts store
                    let length = $textModels.push(textModelNode);
                    $textModels = $textModels;

                    let textReferenceNode = {
                        text,
                        index: uuidv4(),
                        type: 'text', // can be text, comment or drawing
                        x: 100,
                        y: 100,
                        vx: 0,
                        vy: 0,
                        referenceNodes: [...nodes],
                        createdAt: new Date().getTime(),
                        changedAt: new Date().getTime(),
                    }


                    // Push this node into the relations store
                    let relation = {
                        source: textModelNode,
                        target: textReferenceNode,
                        opacity: 1,
                    };
                    $relations.push(relation);
                    $relations = $relations;
                }
                window.getSelection().removeAllRanges();
            }
        });
    });

</script>

<TextRelationsCoordinator />
<div class="w-full h-full top-0 left-0 fixed z-0">
    {#each $textModels as _, i}
        <TextModel bind:textModel={$textModels[i]} />
    {/each}
</div>
<!-- <TimelineComponent /> -->
