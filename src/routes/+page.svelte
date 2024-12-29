<script>
    import { onMount } from "svelte";
    import {marked} from "marked";
    import rangy from 'rangy';
    import { nameShortener } from '$lib/functions/helpers';
    let html = ""
    onMount(async () => {
        window.addEventListener('mouseup', (e) => {
             rangy
                .getSelection()
                ._ranges[0].getNodes()
                .filter((node) => node.nodeName != '#text')
                .map(node => selected.push(node));
        });

        let file = await fetch('./files/latour-a-cautious-promotheus.md')
        let text = await file.text() 
        html = await marked(text);
    })

    let words = $state([]);
    let selected = $state([]);
    let selectedSet = $derived(new Set(selected));
    let doc;
    $effect(() => {
        //After Selection changes do something with the pushed objects
         selected.map(node => {
            node.classList.toggle('underline')
        })
    })
    $effect(() => {
        if (html) {
            doc.innerHTML = html;
            let wordsBuffer = [];
            let children = doc.children;
            for (let child of children) {
                let oldHtml = child.innerHTML;
                child.innerHTML = '';
                let spans = oldHtml.split(' ').map((word) => {
                    let span = document.createElement('span');
                    span.innerHTML = word + ' ';
                    span.style.position = 'relative';
                    span.style.transition = 'all 2s ease 0s';
                    span.style.top = 0;
                    let wordObject = {
                        htmlObject: span,
                        creation: new Date().getTime(),
                        lastTouched: new Date().getTime(),
                    }
                    wordsBuffer.push(wordObject);
                    span.wordInterpretationObject = wordObject;
                    child.appendChild(span);
                });
            }
            words = wordsBuffer;
        }
    });
</script>
<div class="grid grid-cols-12 w-full">
    <div class="col-start-1 col-span-6 relative ml-16" bind:this={doc} id="wrapper{1}">
    </div>
</div>

