<script>
    import { onMount } from "svelte";
    import PageComponent from "$lib/components/PageComponent.svelte";
    import {marked} from "marked";
    let html = ""
    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md')
        let text = await file.text() 
        html = await marked(text);
    })
</script>
<PageComponent text={html} />
