<script>
    import { onMount } from "svelte";

    export let text;
    export let index;
    export let active;
    export let iteration;

    let layerText;
    onMount(() => {
        console.log(active);
        layerText.addEventListener("mouseup", (event) => {
            let selection = window.getSelection();
            console.log(selection.getRangeAt(0));
            if (selection.getRangeAt(0).toString().trim() == "") return;
            let range = selection.getRangeAt(0);
            if (range.startContainer != range.endContainer  == "SPAN") return;
            let span = document.createElement("span");
            span.style.textDecoration = "underline";
            span.style.textDecorationColor = "#ff0000bb";
            span.style.textDecorationThickness = "1.5px";
            span.style.textUnderlineOffset = "1px";
            if (
                selection.anchorOffset != selection.focusOffset &&
                selection.getRangeAt(0).toString().trim() != ""
            ) {
                selection.getRangeAt(0).surroundContents(span);
            }
        });
    });
    $: if(layerText) layerText.innerHTML = text;

</script>
    <div
        id="layer{index}"   
        class="layers absolute text-invisible border rounded-md py-4 px-8 my-8 {active?"z-10  opacity-100":"z-0 opacity-0"}"
    >
        <input type="text" class="border-b w-full mb-4 text-xl text-black font-bold" bind:value={iteration.name} />
        <div bind:this={layerText} class="text"></div>
    </div>


