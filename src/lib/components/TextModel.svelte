<script>
    import { onMount } from 'svelte';
    import { relations } from '$lib/stores';

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);

    onMount(() => {
        textModel.referenceNode = object;
        // Connect the text node with the logical node
        textModel.relations.map((textNode) => {
            $relations.push({
                source: textNode,
                target: textModel,
                createdAt: new Date().getTime(),
                changedAt: new Date().getTime(),
            });
        });

        $relations = $relations;
    });

    function onMouseDown(event) {
        event.preventDefault();
        moving = true;
    }

    function onMouseUp(event) {
        event.preventDefault();
        textModel.changedAt = new Date().getTime();
        moving = false;
    }

    function handleDrag(event) {
        event.preventDefault();
        if (moving) {
            textModel.x += event.movementX;
            textModel.y += event.movementY;
            $relations = $relations;
        }
    }

    function scrollToText(event) {
        event.preventDefault();
        if (!moving) {
            textModel.nodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
<div
    bind:this={object}
    class="absolute cursor-grab max-w-[300px]"
    style:left={textModel.x + 'px'}
    style:top={textModel.y + 'px'}
    draggable="true"
    onmousedown={onMouseDown}
    onclick={scrollToText}>
    <span class="markedText">{textModel.text}</span>
</div>
