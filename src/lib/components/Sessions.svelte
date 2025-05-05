<script>
    import { onMount } from 'svelte';
    import { marked } from 'marked';
    import { docHeight, text, words, textModels, relations, graphVisibility, filePath, paths } from '$lib/stores';

    let { doc = $bindable() } = $props();
    let sessions = $state([]);
    let currentSession = null;
    onMount(async () => {
        getSessions();
    });
    function getSessions() {
        sessions = [];
        let store = Object.keys(localStorage);
        store.forEach((key) => {
            sessions.push(JSON.parse(localStorage.getItem(key)));
        });
    }

    function saveSession() {
        let tms = [];
        let trs = [];
        let drw = [];
        $textModels.map((tm) => {
            let obj = {};
            obj.id = tm.id;
            obj.text = tm.text;
            obj.type = tm.type;
            obj.mode = tm.mode;
            obj.size = tm.size;
            obj.position = { free: { x: 0, y: 0 }, fixed: { x: 0, y: 0 } };
            obj.position.free.x = tm.position.free.x;
            obj.position.free.y = tm.position.free.y;
            obj.position.fixed.x = tm.position.fixed.x;
            obj.position.fixed.y = tm.position.fixed.y;
            obj.nodes = [];
            obj.relations = [];
            obj.opacity = tm.opacity;
            obj.createdAt = tm.createdAt;
            obj.changedAt = tm.changedAt;
            obj.referenceNode = null;
            tms.push(obj);
        });
        $relations
            .filter((tr) => tr.type == 'extracted')
            .map((tr) => {
                let obj = {};
                obj.source = tr.source.id;
                obj.target = tr.target.id;
                obj.type = tr.type;
                obj.createdAt = tr.createdAt;
                obj.changedAt = tr.changedAt;
                trs.push(obj);
            });
        $paths.map((dr) => {
            let obj = {};
            obj.pathGroup = dr.pathGroup;
            obj.changedAt = dr.changedAt;
            obj.opacity = dr.opacity;
            drw.push(obj);
        })
        let date = new Date();

        currentSession = currentSession == null ? `${$filePath} | ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} - ${date.getHours()}:00` : currentSession;
        let session = {
            id: currentSession,
            html: doc.innerHTML,
            textmodels: tms,
            textrelations: trs,
            paths: drw,
            canvasHeight: document.getElementById('drawing-canvas').height,
            canvasWidth: document.getElementById('drawing-canvas').width,
            createdAt: new Date().getTime(),
            changedAt: new Date().getTime(),
        };
        localStorage.setItem(session.id, JSON.stringify(session));
    }
    function getSession(e) {
        let session = localStorage.getItem(e.target.innerText);
        let json = JSON.parse(session);
        currentSession = json.id;
        doc.innerHTML = json.html;
        $textModels = [...json.textmodels];
        json.textrelations.map((tr) => {
            let sourceElement = document.getElementById(tr.source);
            let boundingClientRectText = sourceElement.getBoundingClientRect();
            let target = json.textmodels.find((tm) => tm.id == tr.target);
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
            };
            tr.source = source;
            tr.target = target;
            $relations.push(tr);
        });
        $paths = [...json.paths]
        $relations = [...$relations];
    }
    let timeoutID = null;
    function toggleAutosave(e) {
        if (e.target.checked) {
            timeoutID = setTimeout(() => {
                saveSession();
            }, 60000);
        } else {
            clearTimeout(timeoutID);
        }
    }
</script>

<div class="fixed right-4 bottom-4 cursor-pointer z-[10000] pointer-events-all flex flex-col items-baseline">
    <div class="flex flex-row gap-4">
        <button onclick={saveSession} class="cursor-pointer z-[10000] pointer-events-all">Save</button>

        <label for="autosave">Autosave
            <input type="checkbox" id="autosave" name="autosave" checked={false} onchange="{toggleAutosave}" />

        </label>
    </div>
    {#each sessions as session}
        <button onclick={getSession} class="text-[10px]">{session.id}</button>
    {/each}
</div>
