<script>
    export let word;
    let coordinatesLinear = {
        x: 0,
        y: 0,
    }
    let coorinatesNonLinear = {
        x: 0,
        y: 0,
    }
</script>
<span bind:innerHTML={word.text} contenteditable="false"></span>