<script>
    import { texts, relations } from "$lib/stores";
    import { getMostRightNode } from "$lib/utils";
    import TextModel from "$lib/components/TextModel.svelte";
    import TextRelationsCoordinator from "$lib/components/TextRelationsCoordinator.svelte";
    import { onMount } from "svelte";
    import rangy from 'rangy';
    import TimelineComponent from "./TimelineComponent.svelte";

    const opacityRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9]*\.?[0-9]+)\s*\)/;

    onMount(() => {
        window.addEventListener('mouseup', (e) => {
            e.preventDefault();
            console.log(e.target);
            if (e.target.classList.contains('textElement') || e.target.parentNode.classList.contains('textElement')) {
                let text = '';
                let nodes = rangy
                    .getSelection()
                    ._ranges[0].getNodes()
                if (nodes[nodes.length - 1].nodeName != 'SPAN') {
                    let parent = findSpanParent(nodes[nodes.length - 1])
                    function findSpanParent(node) {
                        if (node.nodeName == 'SPAN') {
                            return node;
                        } else {
                            return findSpanParent(node.parentNode);
                        }
                    }
                    console.log(parent);
                    nodes[nodes.length - 1] = parent
                }
                
                nodes = nodes.filter((node) => node.nodeName == 'SPAN').map((node) => {
                        if (node.wordInterpretationObject){
                            node.wordInterpretationObject.lastTouched = new Date().getTime();
                        }
                        // Set the background color of the selected word to a light purple
                        const opacity = window.getComputedStyle(node).backgroundColor.match(opacityRegex)[1]; // Returns "0.5"
                        console.log(opacity);
                        node.style.backgroundColor = `rgba(255,0,255,${Number(opacity)+0.2})`
                        text += node.innerText + ' ';
                        return node;
                    });
                if (nodes.length > 0) {
                    // Create a logical node with all the information about the selection
                    let modelNode = {
                        text: text,
                        position: { x: 100, y: 100 },
                        otherPositions:{},
                        nodes: [...nodes],
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
                            intensity:0.2 // initial value
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
<TextRelationsCoordinator />
<div class="w-full fixed">
    {#each $texts as _,i}
        <TextModel bind:textObject={$texts[i]} />
    {/each}
</div>
<TimelineComponent />