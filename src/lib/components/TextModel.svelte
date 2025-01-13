<script>
    import { onMount } from 'svelte';
    import { relations, textModels,nodesVisibility,timelineVisibility } from '$lib/stores';
    import { text } from '@sveltejs/kit';
    import CommentDialogComponent from './CommentDialogComponent.svelte';

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let commentFunctionActive = $state(false);
    let commentFunctionDisplay = $state(false);

    onMount(() => {
        textModel.referenceNode = object;
        // Update the relations array to propagate the change in the model node
        $textModels = $textModels;
        $relations = $relations;
    });
    function onMouseDown(event) {
        if (!commentFunctionActive) {
            event.preventDefault();
            moving = true;
        }
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
    function comment(events) {
        events.preventDefault();
        commentFunctionActive = true;
    }
    function displayCommentButton(event) {
        event.preventDefault();
        commentFunctionDisplay = true;
    }
    function hideCommentButton() {
        event.preventDefault();
        commentFunctionDisplay = false;
        commentFunctionActive = false;
    }
    function scrollToText(event) {
        event.preventDefault();
        if (!moving) {
            textModel.nodes[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    $effect(() => {
        if (!textModel.referenceNode.isConnected) {
            textModel.referenceNode = document.querySelector('#textModel-' + textModel.id);
        }
    });
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
<div
    bind:this={object}
    id={'textModel-' + textModel.id}
    class:hidden={!$nodesVisibility}
    class="textModel absolute cursor-grab max-w-[300px]"
    style:left={textModel.x + 'px'}
    style:top={textModel.y + 'px'}
    style:opacity={textModel.opacity}
    draggable="true"
    onmousedown={onMouseDown}
    onclick={scrollToText}
    onmouseenter={displayCommentButton}
    onmouseleave={hideCommentButton}>
    <span class="markedText">{textModel.text}</span>
    <div class="mt-2">
        {#each textModel.comments as comment, commentIndex}
            <div class="grid grid-cols-[auto,1fr] gap-2">
                <div class="flex flex-col">
                    <span
                        class="w-4 h-4 border border-black rounded-full text-[0.7rem] flex items-center justify-center"
                        >{commentIndex + 1}</span>
                </div>
                <span class="text-[#ee0000] max-w-[300px]">{comment}</span>
            </div>
        {/each}
    </div>
    {#if commentFunctionDisplay}
        {#if commentFunctionActive}
            <CommentDialogComponent bind:textModel bind:commentFunctionDisplay bind:commentFunctionActive />
        {:else}
            <p class="commentSection p-0 cursor-pointer -mt-2" onclick={comment}>
                <span class="transform scale-x-[-1] inline-block">↵</span> <span class="underline">Comment</span>
            </p>
        {/if}
    {/if}
</div>
