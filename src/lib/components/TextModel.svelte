<script>
    import { onMount } from 'svelte';
    import { text } from '$lib/stores';
    import { tfidf } from '$lib/utils';


    let { textObject = $bindable() } = $props();
    let object;
    let moving = $state(false);

    onMount(() => {
        textObject.htmlObject = object;
        console.log(textObject.relevance);
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

    function scrollToText(event) {
        event.preventDefault();
        if (!moving) {
            textObject.nodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
<div
    bind:this={object}
    class="absolute cursor-grab max-w-[300px] bg-white"
    style:left={textObject.position.x+'px'}
    style:top={textObject.position.y+'px'}
    draggable="true"
    onmousedown={onMouseDown}
    onclick={scrollToText}>
    <span class="markedText">{textObject.text}</span>
</div>
