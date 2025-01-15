<script>
    import { onMount } from 'svelte';
    import { relations, textModels, nodesVisibility, timelineVisibility, graphVisibility } from '$lib/stores';
    import { text } from '@sveltejs/kit';
    import CommentDialogComponent from './CommentDialogComponent.svelte';
    import { textCollapse } from '$lib/stores';

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let commentFunctionActive = $state(false);
    let commentFunctionDisplay = $state(false);

    onMount(() => {
        textModel.referenceNode = object;
                fetch('http://localhost:8000/similar',{
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    'body': JSON.stringify({
                        'words': textModel.text.trim().replace(/[^a-z\sA-Z]/g, '').split(' '),
                        'top_n': 15
                    })
                })
                .then((relatedWordsRequest) => relatedWordsRequest.json())
                    .then((relatedWordsJson) => {
                        textModel.relatedWords = relatedWordsJson.similar_words.slice(10).map((word) => {return{word:word.word}})
                        console.log(relatedWordsJson,textModel.relatedWords);
                        $textModels = $textModels;
                    });
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
    class="textModel absolute cursor-grab max-w-[300px] bg-[#fffff8]"
    style:left={textModel.x + 'px'}
    style:top={textModel.y + 'px'}
    style:opacity={textModel.opacity}
    draggable="true"
    onmousedown={onMouseDown}
    onclick={scrollToText}
    onmouseenter={displayCommentButton}
    onmouseleave={hideCommentButton}>
    <span class="markedText {$textCollapse ? 'line-clamp-1' : ''}">{textModel.text}</span>
    {#if !$graphVisibility}
        <div>
            {#each textModel.comments as comment, commentIndex}
                <div class="grid grid-cols-[auto,1fr] gap-2">
                    <div class="flex items-center">
                        <span
                            class="w-4 h-4 border border-black rounded-full text-[0.65rem] flex items-center justify-center"
                            >{commentIndex + 1}</span>
                    </div>
                    <span class="text-[#ee0000] max-w-[300px] {$textCollapse ? 'line-clamp-1' : ''}">{comment}</span>
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
    {/if}
</div>
