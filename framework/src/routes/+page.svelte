<script>
    let text = "";
    import { onMount } from "svelte";
    import nlp from "compromise";
    import stats from "compromise-stats";
    import { textToColor } from "$lib/helpers";
    nlp.extend(stats);
    onMount(() => {
        document.addEventListener("mouseup", (event) => {
            let selection = window.getSelection();
            console.log(selection.getRangeAt(0));
            if (selection.getRangeAt(0).toString().trim() == "") return;
            let range = selection.getRangeAt(0);
            if (range.startContainer != range.endContainer  == "SPAN") return;
            let span = document.createElement("span");
            span.style.textDecoration = "underline";
            span.style.textDecorationColor = "rgba(255,0,0,0.6)";
            span.style.textDecorationThickness = "1px";
            span.style.textUnderlineOffset = "2px";
            if (
                selection.anchorOffset != selection.focusOffset &&
                selection.getRangeAt(0).toString().trim() != ""
            ) {
                selection.getRangeAt(0).surroundContents(span);
            }
        });
    });
    let oldElement = 0;
    function switchActive(newElement) {
        document
            .querySelectorAll(`.layers`)
            [oldElement].classList.remove("active");
        document
            .querySelectorAll(`.layers`)
            [newElement].classList.add("active");
        oldElement = newElement;
    }
    let iterations = 0;
    function addIteration() {
        iterations++;
        console.log(iterations);
        let number = iterations;
        let button = document.createElement("button");
        button.innerHTML = `Iteration ${number}`;
        console.log(number);
        button.onclick = () => switchActive(number);
        button.classList.add("iteration-button");
        document.querySelector("#iteration-buttons").appendChild(button);
    }
    let colorDict = {
        "Noun": "red",
        "Verb": "blue",
        "Adjective": "green",
        "Adverb": "purple",
        "Preposition": "orange",
        "Conjunction": "lime",
        "Determiner": "pink",
         "Pronoun": "brown",
    }
    async function getStats(text) {
        if (text === "") return;
        let raw = nlp(text)
            .terms()
            .json()

            console.log(raw);
            
        textTagged = raw
            .map((term) => {
                return `<span style="color:${colorDict[term.terms[0].tags.toReversed()[0]] ?? 'black'}" >${term.text}</span>`;
            })
            .join(" ");

    }
    let textTagged = null;
    let textRaw = null;
    $: {
        getStats(text);
    }

    
</script>

<div class="grid grid-cols-12 w-[700px]">
    <div class="col-span-2 flex flex-col gap-4 p-2" id="iterations">
        <div id="iteration-buttons" class=" flex flex-col gap-4">
            <button
                class="iteration-button"
                on:click={() => {
                    switchActive(0);
                }}>Iteration 0</button
            >
        </div>
        <button class="text-right pr-2" on:click={() => addIteration()}
            >Add Iteration</button
        >
    </div>
    <div class="col-start-3 col-span-5 p-2 h-min flex flex-col gap-4">
        <input
            class="border w-full"
            type="text"
            name="textraw"
            placeholder="Add text to interpret"
            id="text"
            bind:value={text}
        />
        <div id="wrapper" class="w-full text-justify">
            <div
                id="tagger"
                class="analysis pointer-events-none z-20 absolute w-[500px]"
                bind:innerHTML={textTagged}
                contenteditable
            ></div>
            <div
                class="layers active absolute w-[500px]"
                bind:innerHTML={text}
                contenteditable
            ></div>
            {#each { length: iterations } as _, i}
                <div
                    id="text{i}"
                    class="layers absolute w-[500px]"
                    bind:innerHTML={text}
                    contenteditable
                >
                    {text}
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    :global(.iteration-button) {
        border: 1px solid rgb(229, 231, 235);
        text-align: right;
        padding-right: 2px;
    }
    :global(.iteration-button:hover) {
        border-right-width: 8px;
    }
    :global(#wrapper div) {
        opacity: 0.45;
        color: rgba(255, 255, 255, 0);
    }
    :global(#wrapper .active) {
        z-index: 10;
        opacity: 1;
    }
    #tagger {
        z-index: 20;
        opacity: 1;
    }
</style>
