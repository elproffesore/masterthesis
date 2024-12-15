<script>
    import { nameShortener } from "$lib/helpers";
    import WordComponent from "./WordComponent.svelte";
    import { onMount } from "svelte";
    import rangy from 'rangy';

    export let text;
    let words = [];
    let doc;

    onMount(() => {
        window.addEventListener('mouseup', (e) => {
            rangy.getSelection()._ranges[0].getNodes().filter(node => node.nodeName != '#text').map(node => {})})
    })
    $: {
        if(doc != null){
            doc.innerHTML = text;
            let children = doc.children;
            for (let child of children){
                let oldHtml = child.innerHTML;
                child.innerHTML = ''
                let spans = oldHtml.split(' ').map(word => {
                    let span = document.createElement('span')
                    span.innerHTML = word+" "
                    span.style.position = 'relative'
                    span.style.transition = 'all 2s ease 0s'
                    span.style.top = 0
                    words.push({
                        htmlObject: span,
                        creation: new Date().getTime(),
                        lastTouched: new Date().getTime(),
                    })
                    child.appendChild(span)
                })
            }
        }
    }
    
</script>

<div class="grid grid-cols-12 w-full">
    <div class="col-start-1 col-span-6 relative ml-16 h-min flex flex-col gap-4">
        <div bind:this={doc} id="wrapper{1}" class="w-full relative">
            <!-- {#each words as word}
                <WordComponent {word} />
            {/each} -->
            <!-- <LayerComponent text={pdf.text} index={0} active={true} /> -->
        </div>
    </div>
</div>
