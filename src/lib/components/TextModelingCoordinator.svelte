<script>
    import { texts, relations, markingColor } from '$lib/stores';
    import { getMostRightNode } from '$lib/utils';
    import TextModel from '$lib/components/TextModel.svelte';
    import TextRelationsCoordinator from '$lib/components/TextRelationsCoordinator.svelte';
    import { onMount } from 'svelte';
    import rangy from 'rangy';
    import TimelineComponent from './TimelineComponent.svelte';
    import { tfidf } from '$lib/utils';
    import LayerOptions from './LayerOptions.svelte';

    const opacityRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9]*\.?[0-9]+)\s*\)/;

    function findSpanParentRecursive(node, level = 0) {
        // Stop recursion if the node is a space or the correct node
        if (node.nodeName == 'SPAN'){ 
            return node;
        }  
        // Stop recursion after 3 levels
        if (level == 3){ 
            return null;
        } 
        // Recursively get the parent node and check if it is a span
        return findSpanParentRecursive(node.parentNode, level + 1); 
    }

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
                    // Set the last touched time of the word object to the current time
                    if (node.wordInterpretationObject) {
                        node.wordInterpretationObject.lastTouched = new Date().getTime();
                    }
                    // Set the background color of the selected word to a light purple
                    const opacity = window.getComputedStyle(node).backgroundColor.match(opacityRegex)[1]; // Returns "0.5"
                    let colors = Array.from($markingColor.matchAll(/\d+/g))
                    node.style.backgroundColor = `rgba(${colors[0]},${colors[1]},${colors[2]},${Number(opacity) + 0.2})`;
                    text += node.innerText + ' ';
                });

                if (nodes.length > 0) {
                    // Create a logical node with all the information about the selection
                    let modelNode = {
                        text: text,
                        position: { x: 100, y: 100 },
                        otherPositions: {},
                        relevance:  tfidf.tfidfs(text.trim())[0],
                        nodes,
                        htmlObject: null,
                        createdAt: new Date().getTime(),
                        lastTouched: new Date().getTime(),
                    };
                    // Push this node into the texts store
                    let length = $texts.push(modelNode);
                    $texts = $texts;
                    // Get the most right node which we will connect via a relation link on the canvas
                    let mostRightNode = getMostRightNode(nodes);
                    // Connect the text node with the logical node
                    $relations.push({
                        textNode: mostRightNode,
                        modelNode: $texts[length - 1],
                        relationSemanitcs: {
                            intensity: 0.2, // initial value
                        },
                        createdAt: new Date().getTime(),
                        lastTouched: new Date().getTime(),
                    });
                    $relations = $relations;
                }
                window.getSelection().removeAllRanges();
            }
        });
    });
</script>

<LayerOptions/>
<TextRelationsCoordinator />
<div class="w-full fixed">
    {#each $texts as _, i}
        <TextModel bind:textObject={$texts[i]} />
    {/each}
</div>
<TimelineComponent />
