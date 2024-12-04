<script>
    import nlp from "compromise";
    import stats from "compromise-stats";
    nlp.extend(stats);
    import {posColors} from "$lib/helpers";
    // 
    export let text;
    export let tagSet;
    export let highlight;
    //
    let tagger;
    let textSet = []
    async function getStats(text) {
        if (text === "") return;
        textSet = []
        tagSet = []
        let tagSetRaw = []
        let raw = nlp(text).terms().json();
        raw.map(term => {
            textSet.push(term)
            tagSetRaw.push(term.terms[0].tags.toReversed()[0])
        })
        tagSet = [...new Set(tagSetRaw)]
        
        // tagger.innerHTML = raw
        //     .map((term) => {
        //        //tagSet.push(term.terms[0].chunk)
        //         tagSet.push(term.terms[0].tags.toReversed()[0])
        //         let classList = "";
        //         term.terms[0].tags.map(tag => {
        //             classList += `${tag} `;
        //         });
        //         return `<span onclass class="relative ${term.terms[0].tags.toReversed()[0]}">${term.text}</span>`;
        //     })
        //     .join(" ");
        // tagSet = [...new Set(tagSet)];
    }
    $: getStats(text);
    $: if (tagger){
        if(highlight != null){
            tagger.querySelectorAll('#tagger span').forEach(span => span.classList.add('Disabled'))
            tagger.querySelectorAll(`.${highlight}`).forEach(span => {
                span.classList.remove('Disabled')
                span.classList.add('Active')
            }
        )
        }else{
            tagger.querySelectorAll('#tagger span').forEach(span => {
                span.classList.remove('Disabled')
                span.classList.remove('Active')
            })
        }
    }
</script>
    <div
        id="tagger"
        bind:this={tagger}
        class="pointer-events-none opacity-100 z-20 absolute py-4 px-8 my-8"
    >
        <input type="text" value="Hello" class="invisible text-xl mb-4 font-[#ffffff00]">
        <div class="terms">
            {#each textSet as term}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="relative {term.terms[0].tags.toReversed()[0]}">{term.text+' '}</span>
        {/each}
        </div>
    </div>

<style>

    :global(.Noun::after, .Singular::after, .Verb::after, .Adjective::after){
        content: "";        
        position: absolute;
        left: 50%;
        top: -3px;
        transform: translateX(-50%);
        height: 3px;
        width: 3px;
        border-radius: 50%;
        transition: all 0.3s;
        pointer-events: all;
    }
    :global(.Noun::after){
        background-color: rgb(255, 69, 52);
    }
    :global(.Verb::after){
        background-color: rgb(24, 78, 255);
    }
    :global(.Adjective::after){
        background-color: rgb(5, 255, 51);
    }
    :global(.Noun:hover::after, .Verb:hover::after, .Adjective:hover::after , .Singular:hover::after){
        height: 10px;
        width: 10px;
        top: -6px;
    }
    :global(#tagger span.Disabled){
        opacity: 0.1;
    }
    :global(#tagger span.Active::after){
        top: -6px;
        height: 6px;
        width: 6px;
    }
</style>
