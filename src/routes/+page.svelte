<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { nameShortener, getMostRightNode } from '$lib/functions';
    import { relations, texts } from '$lib/stores';
    import rangy from 'rangy';
    import TextModelingCoordinator from '$lib/components/TextModelingCoordinator.svelte';

    let html = $state('');
    let words = $state([]);
    let doc;
    onMount(() => {
        window.addEventListener('mouseup', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('textElement')) {
                console.log(rangy
                    .getSelection()
                    ._ranges[0].getNodes());
                let text = '';
                let nodes = rangy
                    .getSelection()
                    ._ranges[0].getNodes()
                    .filter((node) => node.nodeName == 'SPAN')
                    .map((node) => {
                        if (node.wordInterpretationObject){
                            node.wordInterpretationObject.lastTouched = new Date().getTime();
                        }
                        // Toggle the underline class of the span element
                        node.classList.toggle('underline');
                        text += node.innerText + ' ';
                        return node;
                    });
                if (nodes.length > 1) {
                    // Create a logical node with all the information about the selection
                    let modelNode = {
                        text: text,
                        position: { x: 0, y: 0 },
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
                        createdAt: new Date().getTime(),
                        lastTouched: new Date().getTime(),
                    });
                    $relations = $relations;
                }
                window.getSelection().removeAllRanges();
            }
        });
    });
    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        let text = await file.text();
        html = await marked(text);
    });
    $effect(() => {
        if (html) {
            doc.innerHTML = html;
            let wordsBuffer = [];
            let children = doc.children;
            // Iterate over all child elements and split them into words
            for (let child of children) {
                let oldHtml = child.innerHTML;
                child.innerHTML = '';
                // Each word is wrapped in a span element which can be adressed later
                let spans = oldHtml.split(' ').map((word) => {
                    let span = document.createElement('span');
                    span.innerHTML = word + ' ';
                    span.classList.add('textElement');
                    // A word object is created to store information about the interactions with the word
                    let wordObject = {
                        htmlObject: span,
                        creation: new Date().getTime(),
                        lastTouched: new Date().getTime(),
                    };
                    wordsBuffer.push(wordObject);
                    // The word object is stored in the span element
                    span.wordInterpretationObject = wordObject;
                    child.appendChild(span);
                });
            }
            // The word objects are stored in the words state
            words = wordsBuffer;
        }
    });
</script>
<div class="grid grid-cols-12 w-full py-[100px]">
    <div class="col-start-1 col-span-4 relative ml-16 text-justify" bind:this={doc} id="textWrapper"></div>
    <div class="col-start-5 col-span-8 relative" id="selectedWords">
        <TextModelingCoordinator />
    </div>
</div>

<style>
    :global(#textWrapper span) {
        position: relative;
        transition: all 2s ease 0s;
        top: 0;
    }
</style>
