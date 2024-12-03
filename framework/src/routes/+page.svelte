<script>
    let text = "";
    import { onMount } from "svelte";
    onMount(() => {
        document.addEventListener("mouseup", (event) => {
            let selection = window.getSelection();
            if (selection.rangeCount > 0) {
                let range = selection.getRangeAt(0);
                let commonAncestor = range.commonAncestorContainer;
                if (commonAncestor.nodeType === 3) {
                    commonAncestor = commonAncestor.parentNode;
                }
                if (commonAncestor.tagName === "span") {
                    let parent = commonAncestor.parentNode;
                    while (commonAncestor.firstChild) {
                        parent.insertBefore(commonAncestor.firstChild, commonAncestor);
                    }
                    parent.removeChild(commonAncestor);
                }
            }
            let span = document.createElement("span");
            span.style.textDecoration = "underline";
            span.style.textDecorationColor = "rgba(255,0,0,0.6)";
            if (selection.anchorOffset != selection.focusOffset && selection.getRangeAt(0).toString().trim() != "") {
                selection.getRangeAt(0).surroundContents(span);
            }
        });
    });
    let oldElement = 0
    function switchActive(element){
        console.log(element,oldElement,iterations);
        document.querySelectorAll('#wrapper div')[oldElement].classList.toggle('active');
        document.querySelectorAll('#wrapper div')[element].classList.toggle('active');
        oldElement = element;
    }
    let iterations = 0;
    function addIteration(){
        iterations++;
        let number = iterations;
        let button = document.createElement('button');
        button.innerHTML = `Iteration ${number}`;
        button.onclick = () => switchActive(number);
        button.classList.add('border');
        document.querySelector('.iterations').appendChild(button);
        let div = document.createElement('div');
        div.innerText = text;
        div.classList.add('absolute', 'mt-8', 'w-[500px]');
        document.querySelector('#wrapper').appendChild(div);
    }
</script>

<div class="grid grid-cols-12">
    <div class="col-span-2 flex flex-col gap-4 border p-4" id="iterations">
        <h1>Iterations</h1>
        <div class="iterations flex flex-col gap-4">
            <button class="border" on:click="{() => {switchActive(0)}}">Iteration 0</button>
        </div>
        <hr>
        <button on:click="{() => addIteration()}">Add Iteration</button>
    </div>
    <div class="col-start-4 col-span-5 border p-4 h-min">
        <input class="border w-full" type="text" name="textraw" id="text" bind:value={text} />
        <div id="wrapper" class="w-full border h-min text-justify">
            <div class="active absolute mt-8 w-[500px]">{text}</div>
        </div>
    </div>

</div>



<style>
    :global(#wrapper div) {
        opacity: 0.1;
        color: rgba(255,255,255,0.0)
    }
    :global(#wrapper .active) {
        z-index: 10;
        opacity: 1;
        color: rgba(0,0,0,1.0)
    }
</style>
