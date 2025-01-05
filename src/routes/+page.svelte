<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { text } from '$lib/stores';
    import TextModelingCoordinator from '$lib/components/TextModelingCoordinator.svelte';
    import { tfidf } from '$lib/utils';

    let html = $state('');
    let words = $state([]);
    let doc;

    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        $text = await file.text();
        tfidf.addDocument($text);
        html = await marked($text);
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
<div class="w-full pt-[70px] pl-[30px]">
    <div id="textWrapper" class="w-[36%] relative text-justify" bind:this={doc} ></div>
    <div id="selectedWords" class="w-[60%] h-screen left-[40%] fixed top-0" >
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
