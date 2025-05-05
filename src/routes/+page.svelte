<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { docHeight, filePath, text, words } from '$lib/stores';
    import TextModelCoordinator from '$lib/components/TextModelCoordinator.svelte';
    import winkNLP from 'wink-nlp';
    import model from 'wink-eng-lite-web-model';
    import { get } from 'svelte/store';
    import Sessions from '$lib/components/Sessions.svelte';
    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;
    let html = $state('');
    let doc = $state(null);
    onMount(async () => {
        //Fetch markdown file and convert it to html
        //let file = await fetch('./files/masterthesis.md');
        let file = await fetch('./files/latour-a-cautious-promotheus-short.md');
        //let file = await fetch('./files/tversky-visualizing-thought.md');
        $filePath = new URL(file.url).pathname.replace('/files/', '');
        $text = await file.text();
        html = await marked($text);
        $words = Array.from(
            new Set(
                nlp
                    .readDoc($text)
                    .tokens()
                    .filter((t) => !t.out(its.stopWordFlag) && t.out(its.type) == 'word' && t.out(its.pos) == 'NOUN')
                    .out()
            ),
        );
        // Set the innerHTML of the source wrapper to the text and publish its height
        doc.innerHTML = html;
        $docHeight = doc.getBoundingClientRect().height;
    });

</script>
<Sessions bind:doc/>
<div class="">
    <div id="textWrapper" class="my-8 mx-auto w-[40%] left-[2%] absolute z-[1000] transition-all duration-1000" bind:this={doc}></div>
    <TextModelCoordinator />
</div>

<style>
    :global(#textWrapper span) {
        position: relative;
        transition: display 2s ease 0s;
        top: 0;
    }
</style>
