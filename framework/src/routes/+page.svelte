<script>
    import { onMount } from "svelte";
    import PageComponent from "../components/PageComponent.svelte";
    import * as pdfjs from 'pdfjs-dist';
    import * as pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs';
    pdfjs.GlobalWorkerOptions.workerSrc = import.meta.url + 'pdfjs-dist/build/pdf.worker.mjs'; 

    let text = "";
    let pdf = null;
    async function loadPage(){
        let buffer = await pdf.files[0].arrayBuffer()
        pdfjs.getDocument(buffer).promise
            .then(pdf => {
                pdf.getPage(1)
                .then(page => {
                    page.getTextContent()
                    .then(content => {
                    text = content.items.map(item => item.str).join(' ');
                    });
                });
            });
    }
</script>
{#if text == ''}
<input type="file" bind:this={pdf} on:change={() => {loadPage()}} accept="application/pdf">
{/if}
<PageComponent {text} page={0} />
