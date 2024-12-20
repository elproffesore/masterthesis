<script>
    import { nameShortener } from '$lib/functions/helpers';
    import { onMount } from 'svelte';
    import rangy from 'rangy';
    let { text = $bindable() } = $props();
    let words = $state([]);
    let selected = $state([]);
    let selectedSet = $derived(new Set(selected));
    let doc;

    onMount(() => {
        window.addEventListener('mouseup', (e) => {
             rangy
                .getSelection()
                ._ranges[0].getNodes()
                .filter((node) => node.nodeName != '#text')
                .map(node => selected.push(node));
        });
    });
    $effect(() => {
        //After Selection changes do something with the pushed objects
         selected.map(node => {
            console.log(node.getBoundingClientRect());
            node.classList.toggle('underline')
        })
    })
    $effect(() => {
        if (text) {
            doc.innerHTML = text;
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
