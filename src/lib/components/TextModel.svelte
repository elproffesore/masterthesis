<script>
    import { onMount } from 'svelte';
    import { relations,models, simulation, textModels,graphVisibility } from '$lib/stores';
    import { text } from '@sveltejs/kit';
    import { getBoundingClientOfNodeGroup } from '$lib/utils';

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);

    onMount(() => {
        if (textModel.type != 'text') {
            textModel.referenceNodes.push(object)
        }else{
            let boundingBox = getBoundingClientOfNodeGroup(textModel.referenceNodes)
            textModel.x = boundingBox.center.x
            textModel.y = boundingBox.center.y
        }
    });

    function onMouseDown(event) {
        event.preventDefault();
        moving = true;
    }

    function onMouseUp(event) {
        event.preventDefault();
        textModel.changedAt = new Date().getTime();
        moving = false;
        if($graphVisibility){
            $simulation.restart();
        }
        $textModels = $textModels;
        $relations = $relations;
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
            textModel.textReferenceNodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
{#if textModel.type != 'text'}
<div
    bind:this={object}
    class="absolute cursor-grab max-w-[300px] z-[100] bg-[#fffff8]"
    style:left={textModel.x + 'px'}
    style:top={textModel.y + 'px'}
    draggable="true"
    onmousedown={onMouseDown}
    onclick={scrollToText}>
    <span class="markedText z-[100]">{textModel.text}</span>
</div>
{/if}