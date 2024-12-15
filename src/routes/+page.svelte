<script>
    import { onMount } from "svelte";
    import PageComponent from "../components/PageComponent.svelte";
    import {marked} from "marked";
    import * as pdfjs from "pdfjs-dist";
    import * as pdfWorker from "pdfjs-dist/build/pdf.worker.mjs";
    pdfjs.GlobalWorkerOptions.workerSrc =
        import.meta.url + "pdfjs-dist/build/pdf.worker.mjs";

    let pdf = null;
    let pdfs = [];
    let loaded = false;
    let html = ""
    onMount(async () => {
        let file = await fetch('./files/latour-a-cautious-promotheus.md')
        let text = await file.text() 
        html = await marked(text);
    })
</script>
<PageComponent text={html} />
