<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { text } from '$lib/stores';
    import TextModelingCoordinator from '$lib/components/TextModelingCoordinator.svelte';

    let html = $state('');
    let doc;

    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        let rawText = await file.text();
        rawText = rawText.split('\n').slice(0,7).map((line) => line + '\r\r').join('');
        $text = rawText
        html = await marked($text);
        doc.innerHTML = html;
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
                child.appendChild(span);
            });
        }
    });
</script>

<div id="textWrapper" class="w-[33%] mt-8 relative mx-auto text-justify" bind:this={doc}></div>
<TextModelingCoordinator />

<style>
    :global(#textWrapper span) {
        position: relative;
        transition: display 2s ease 0s;
        top: 0;
        background-color: rgba(255, 255, 255, 0);
    }
</style>
