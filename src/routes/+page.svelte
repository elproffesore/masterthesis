<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { text } from '$lib/stores';
    import TextModelingCoordinator from '$lib/components/TextModelingCoordinator.svelte';
    import { graphVisibility } from '$lib/stores';

    let html = $state('');
    let doc;

    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        let rawText = await file.text();
        rawText = rawText
            .split('\n')
            .slice(0)
            .map((line) => line + '\r\r')
            .join('');
        $text = rawText;
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

<div class="">
    <div id="textWrapper" class="ml-8 w-1/3 mt-8 absolute left-0 z-10 transition-all duration-1000" style:left={$graphVisibility ? '-40%' :'0'} bind:this={doc}></div>
    <TextModelingCoordinator />
</div>

<style>
    :global(#textWrapper span) {
        position: relative;
        transition: display 2s ease 0s;
        top: 0;    
        }
</style>
