<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { docHeight, text, words,textModels, relations,graphVisibility } from '$lib/stores';
    import TextModelCoordinator from '$lib/components/TextModelCoordinator.svelte';
    import posTagger from 'wink-pos-tagger';
    import winkUtils from 'wink-nlp-utils';
    import { semanticalyRelativeWordsInText } from '$lib/utils';
    import { get } from 'svelte/store';
    import { local } from 'd3';
    let tagger = posTagger();
    let html = $state('');
    let doc;
    let sessions = $state([]);
    let path = '';
    let db = null;
    let objectStore = null
    let currentSession = null
    onMount(async () => {
        //Fetch markdown file and convert it to html
        //let file = await fetch('./files/masterthesis.md');
        let file = await fetch('./files/latour-a-cautious-promotheus.md');
        //let file = await fetch('./files/tversky-visualizing-thought.md');
        path = new URL(await file.url).pathname.replace('/files/', '');
        $text = await file.text();
        html = await marked($text);

        // Set the innerHTML of the source wrapper to the text and publish its height
        doc.innerHTML = html;
        $docHeight = doc.getBoundingClientRect().height;
        // getSessions();
        // setTimeout(() => {
        //     saveSession()
        // },60000)
    });
    function getSessions() {
        sessions = [];
        let store = Object.keys(localStorage)
        store.forEach((key) => {
            sessions.push(JSON.parse(localStorage.getItem(key)));
        });
    }

    function saveSession() {
        let tms = []
        let trs = []
        $textModels.map((tm) => {
            let obj = {}
            obj.id = tm.id
            obj.text = tm.text
            obj.type = tm.type
            obj.mode = tm.mode
            obj.position = {free:{x:0,y:0},fixed:{x:0,y:0}}
            obj.position.free.x = tm.position.free.x
            obj.position.free.y = tm.position.free.y
            obj.position.fixed.x = tm.position.fixed.x
            obj.position.fixed.y = tm.position.fixed.y
            obj.nodes = []
            obj.relations = []
            obj.opacity = tm.opacity
            obj.createdAt = tm.createdAt
            obj.changedAt = tm.changedAt
            obj.referenceNode = null
            tms.push(obj);
        })
        $relations.filter(tr => tr.type == "extracted").map((tr) => {
            let obj = {}
            obj.source = tr.source.id
            obj.target = tr.target.id
            obj.type = tr.type
            obj.createdAt = tr.createdAt
            obj.changedAt = tr.changedAt
            trs.push(obj);
        })
        let date = new Date()
        
        currentSession = currentSession == null ? `${path} | ${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} - ${date.getHours()}:00`: currentSession
        let session = {
            id: currentSession,
            html: doc.innerHTML,
            textmodels: tms,
            textrelations: trs,
            canvas: document.getElementById('drawing-canvas').innerHTML,
            canvasHeight: document.getElementById('drawing-canvas').height,
            canvasWidth: document.getElementById('drawing-canvas').width,
            createdAt: new Date().getTime(),
            changedAt: new Date().getTime(),
        };
        localStorage.setItem(session.id, JSON.stringify(session));
    }
    function getSession(e){
        let session = localStorage.getItem(e.target.innerText)
        let json = JSON.parse(session)
        currentSession = json.id
        doc.innerHTML = json.html
        $textModels = [...json.textmodels]
        json.textrelations.map((tr) => {
            let sourceElement = document.getElementById(tr.source)
            let boundingClientRectText = sourceElement.getBoundingClientRect();
            let target = json.textmodels.find((tm) => tm.id == tr.target)
            let source = {
                id: tr.source,
                text: sourceElement.innerText,
                type: tr.type,
                x: boundingClientRectText.x,
                y: boundingClientRectText.y,
                node: sourceElement,
                opacity: 1,
                createdAt: new Date().getTime(),
                changedAt: new Date().getTime(),
            }
            tr.source = source
            tr.target = target
            $relations.push(tr)
        })
        $relations = [...$relations]
        let canvas = document.getElementById('drawing-canvas')
        document.getElementById('sessionStores').innerHTML += json.canvas
    }
</script>

<!-- <button onclick={saveSession} class="absolute left-4 top-4 cursor-pointer z-[10000] pointer-events-all">Save</button>
<div class="absolute left-4 top-10 cursor-pointer z-[10000] pointer-events-all flex flex-col items-baseline">
    {#each sessions as session}
        <button onclick="{getSession}" class="text-[10px]">{session.id}</button>
    {/each}
</div> -->
<!-- 
<div class="">
    <div id="textWrapper" class="my-16 mx-auto w-[40%] left-[50%] -translate-x-[55%] absolute z-[1000] transition-all duration-1000" bind:this={doc}></div>
    <TextModelCoordinator />
</div> -->

<div class="">
    <div id="textWrapper" class="my-16 mx-auto w-[40%] left-[2%] absolute z-[1000] transition-all duration-1000" bind:this={doc}></div>
    <TextModelCoordinator />
</div>


<style>
    :global(#textWrapper span) {
        position: relative;
        transition: display 2s ease 0s;
        top: 0;
    }
</style>
