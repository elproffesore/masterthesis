<script>
    import { textModels, relations, graphVisibility } from '$lib/stores';
    import { getMostRightNode, findSpanParentRecursive, opacityRegex, getMostLeftNode } from '$lib/utils';
    import TextModel from '$lib/components/TextModel.svelte';
    import Timeline from './Timeline.svelte';
    import LayerOptions from './LayerOptions.svelte';
    import Graph from './Graph.svelte';
    import TextRelations from '$lib/components/TextRelations.svelte';
    import Canvas from './Canvas.svelte';
    import { onMount } from 'svelte';
    import { v4 as uuidv4 } from 'uuid';
    import rangy from 'rangy';

    onMount(() => {
        window.addEventListener('mouseup', (e) => {
            if (e.target.nodeName != 'INPUT') {
                e.preventDefault();
                try {
                    let range = rangy.getSelection()._ranges[0];
                    if (range == undefined || Math.abs(range.nativeRange.startOffset - range.nativeRange.endOffset) < 2) {
                        return;
                    }
                    // Create a span element and wrap the selected text with it
                    let spanWrapper = document.createElement('span');
                    spanWrapper.classList.add('extracted');
                    spanWrapper.id = uuidv4();
                    range.surroundContents(spanWrapper);
                    let blacklistRange = {
                        start: range.startOffset,
                        end: range.endOffset,
                        container: range.startContainer,
                    };
                    window.getSelection().removeAllRanges();
                    // Set text to the innerText of the span
                    let text = spanWrapper.innerText;
                    // Create or link model for the selected text
                    let model = null;
                    let similarModel = $textModels.find((model) => model.text.toLocaleLowerCase() == text.toLocaleLowerCase());
                    if (similarModel != undefined) {
                        model = similarModel;
                    } else {
                        model = {
                            text: text,
                            id: uuidv4(),
                            mode: 'free', // free, fixed
                            position: {
                                free: {
                                    // x: spanWrapper.getBoundingClientRect().x > window.innerWidth / 2 ? window.innerWidth * 0.8 : window.innerWidth * 0.1,
                                    x: window.innerWidth * 0.6,
                                    y: window.scrollY + window.innerHeight / 2,
                                },
                                fixed: {
                                    x: 0,
                                    y: 0,
                                },
                            },
                            nodes: [spanWrapper],
                            referenceNode: null,
                            relations: [],
                            relatedWords: [],
                            showRelatedWords: false,
                            timelineOpacity: 1,
                            opacity: 1,
                            size: 16,
                            createdAt: new Date().getTime(),
                            changedAt: new Date().getTime(),
                        };
                        spanWrapper.classList.add('modelRef-'+model.id);
                        // Push this node into the texts store
                        let length = $textModels.push(model);
                        model = $textModels[length - 1];
                        $textModels = $textModels;
                    }
                    let boundingClientRectText = spanWrapper.getBoundingClientRect();
                    let textNode = {
                        id: spanWrapper.id,
                        text: text,
                        type: 'extracted',
                        x: boundingClientRectText.x,
                        y: boundingClientRectText.y,
                        node: spanWrapper,
                        opacity: 1,
                        createdAt: new Date().getTime(),
                        changedAt: new Date().getTime(),
                    };
                    // Connect the text node with the logical node
                    let relationsLength = $relations.push({
                        source: textNode,
                        target: model,
                        type: 'extracted',
                        createdAt: new Date().getTime(),
                        changedAt: new Date().getTime(),
                        opacity: 1,
                    });

                    // Update the model with the new relation
                    $relations = [...$relations];
                    model.relations.push($relations[relationsLength - 1]);
                    $textModels = [...$textModels];
                } catch (e) {
                    console.log(e);
                }
            }
        });
    });
    
</script>

<LayerOptions />
<TextRelations />
<Graph />
<Canvas />
<Timeline />
<div class="w-full h-full top-0 left-0 absolute transition-all duration-1000">
    {#each $textModels as _, i}
        <TextModel bind:textModel={$textModels[i]} />
    {/each}
</div>
