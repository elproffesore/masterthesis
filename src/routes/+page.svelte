<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import TextModelingCoordinator from '$lib/components/TextModelingCoordinator.svelte';

    let html = $state('');
    let words = $state([]);
    let doc;

    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        let text = await file.text();
        html = await marked(text);
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
    });
</script>
<div class="grid grid-cols-12 w-full pt-[70px] pl-[30px]">
    <div id="textWrapper" class="col-start-1 col-span-4 relative text-justify" bind:this={doc} ></div>
    <div id="selectedWords" class="col-start-5 col-span-8 relative" >
        <TextModelingCoordinator />
    </div>
</div>

<style>
    :global(#textWrapper span) {
        position: relative;
        transition: display 2s ease 0s;
        top: 0;
        background-color: rgba(255,255,255,0);
    }
</style>
