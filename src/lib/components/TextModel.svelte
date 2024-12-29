<script>
    import { onMount } from 'svelte';

    let { textObject = $bindable() } = $props();
    let object;
    let moving = $state(false);
    onMount(() => {
        textObject.htmlObject = object;
    });
    function onMouseDown(event) {
        event.preventDefault();
        moving = true;
    }
    function onMouseUp(event) {
        event.preventDefault();
        textObject.lastTouched = new Date().getTime();
        moving = false;
    }
    function handleDrag(event) {
        event.preventDefault();
        if (moving) {
            textObject.position.x += event.movementX;
            textObject.position.y += event.movementY;
        }
    }

    function handleDragStart(event) {
        event.dataTransfer.setDragImage(new Image(), 0, 0);
    }
    function scrollToText(event) {
        event.preventDefault();
        if (!moving){
            textObject.nodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

    }
</script>
<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions -->
<button
    bind:this={object}
    class="draggable"
    style="transform: translate({textObject.position.x}px, {textObject.position.y}px);"
    draggable="true"
    onmousedown={onMouseDown}
    onclick={scrollToText}>
    {textObject.text}
</button>


<style>
    .draggable {
        position: absolute;
        cursor: grab;
    }
</style>
