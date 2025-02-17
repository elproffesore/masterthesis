<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { docHeight, text, words } from '$lib/stores';
    import TextModelCoordinator from '$lib/components/TextModelCoordinator.svelte';
    import { graphVisibility } from '$lib/stores';
    import posTagger from 'wink-pos-tagger';
    import winkUtils from 'wink-nlp-utils';
    import { semanticalyRelativeWordsInText } from '$lib/utils';
    let tagger = posTagger();
    let html = $state('');
    let doc;

    onMount(async () => {
        //Fetch markdown file and convert it to html
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        $text = await file.text();
        html = await marked($text);

        // Set the innerHTML of the source wrapper to the text and publish its height
        doc.innerHTML = html;
        $docHeight = doc.getBoundingClientRect().height;
    });
</script>

<div class="">
    <div id="textWrapper" class="my-16 mx-auto w-[40%] left-[50%] -translate-x-[55%] absolute z-[1000] transition-all duration-1000" bind:this={doc}></div>
    <TextModelCoordinator />
</div>

<style>
    :global(#textWrapper span) {
        position: relative;
        transition: display 2s ease 0s;
        top: 0;
    }
</style>
