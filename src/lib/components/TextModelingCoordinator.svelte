<script>
    import { textModels, relations, markingColor } from '$lib/stores';
    import { getMostRightNode, findSpanParentRecursive, opacityRegex, getMostLeftNode } from '$lib/utils';
    import TextModel from '$lib/components/TextModel.svelte';
    import TextRelationsCoordinator from '$lib/components/TextRelationsCoordinator.svelte';
    import { onMount } from 'svelte';
    import rangy from 'rangy';
    import TimelineComponent from './TimelineComponent.svelte';
    import LayerOptions from './LayerOptions.svelte';
    import { v4 as uuidv4 } from 'uuid';
    import { markingType } from '$lib/stores';
    import { graphVisibility } from '$lib/stores';

    onMount(() => {
        window.addEventListener('mouseup',(e) => {
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
                    switch($markingType){
                        case 'highlight':
                            node.style.backgroundColor = `rgba(${colors[0]},${colors[1]},${colors[2]},${Number(opacity) + 0.2})`;
                            break;
                        case 'underline':
                            node.style.textDecoration = 'underline';
                            node.style.textDecorationThickness = '1.5px';
                            node.style.textDecorationColor = `rgba(${colors[0]},${colors[1]},${colors[2]},${Number(opacity) + 0.4})`;
                            break;
                        case 'wave':
                            node.style.textDecoration = 'underline wavy';
                            node.style.textDecorationThickness = '1.5px';
                            node.style.textDecorationColor = `rgba(${colors[0]},${colors[1]},${colors[2]},${Number(opacity) + 0.4})`;
                            break;
                    }
                    text += node.innerText + ' ';
                    node.classList.add('selected');
                });

                if (nodes.length > 0) {
                    // Create a logical node with all the information about the selection
                    let model = null;
                    let similarModel = $textModels.find((model) => model.text.toLocaleLowerCase() == text.toLocaleLowerCase());
                    if (similarModel != undefined) {
                        model = similarModel;
                    } else {
                        let textModelNode = {
                            text: text,
                            id: uuidv4(),
                            x: window.innerWidth / 2,
                            y: window.innerHeight / 2,
                            nodes,
                            referenceNode: null,
                            comments: [],
                            relations: [],
                            relatedWords:[],
                            opacity: 1,
                            createdAt: new Date().getTime(),
                            changedAt: new Date().getTime(),
                        };

                        // Push this node into the texts store
                        let length = $textModels.push(textModelNode);
                        model = $textModels[length - 1];
                        $textModels = $textModels;
                    }
                    let boundingClientRectText = getMostRightNode(nodes).getBoundingClientRect();
                    let textNode = {
                        text: text,
                        x: boundingClientRectText.x,
                        y: boundingClientRectText.y,
                        nodes,
                        opacity: 1,
                        createdAt: new Date().getTime(),
                        changedAt: new Date().getTime(),
                    };
                    // Connect the text node with the logical node
                    let relationsLength = $relations.push({
                        source: textNode,
                        target: model,
                        createdAt: new Date().getTime(),
                        changedAt: new Date().getTime(),
                        opacity: 1,
                    });
                    $relations = $relations;
                    model.relations.push($relations[relationsLength - 1]);
                    $textModels = $textModels;
                }
                window.getSelection().removeAllRanges();
            }
        });
    });
</script>

<LayerOptions />
<TextRelationsCoordinator />
<div class="w-full h-full top-0 left-0 fixed z-0 transition-all duration-1000">
    {#each $textModels as _, i}
        <TextModel bind:textModel={$textModels[i]} />
    {/each}
</div>
<TimelineComponent />
