<script>
    import { onMount } from 'svelte';
    import { relations, textModels, nodesVisibility, timelineVisibility, graphVisibility, words } from '$lib/stores';
    import CommentDialogComponent from './CommentDialogComponent.svelte';
    import { textCollapse } from '$lib/stores';
    import { semanticalyRelativeWordsInText, getMostRightNode, powScale, semanticalySimilarWords } from '$lib/utils';
    import { text } from '@sveltejs/kit';

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let commentFunctionActive = $state(false);
    let commentFunctionDisplay = $state(false);

    onMount(() => {
        textModel.referenceNode = object;

        semanticalyRelativeWordsInText(textModel.text.split(' ')[0], $words)
            .then((words) => {
                console.log(words)
                words = words
                    .filter((word) => word[1] > 0.3 && word[1] < 0.99) // remove words with a low score
                    .sort((a, b) => b[1] - a[1]) // sort by score
                    .slice(0, 5); // get the top 5 words
                    

                textModel.relatedWords = words;
                words.map((word, i) => {
                    let node = document.querySelector('.' + word[0]);
                    if (node) {
                        node.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                        let boundingClientRectText = getMostRightNode([node]).getBoundingClientRect();
                        let textNode = {
                            text: word[0],
                            x: boundingClientRectText.x,
                            y: boundingClientRectText.y,
                            nodes: [node],
                            opacity: 1,
                            createdAt: new Date().getTime(),
                            changedAt: new Date().getTime(),
                        };
                        // Connect the text node with the logical node
                        let relationsLength = $relations.push({
                            source: textNode,
                            target: textModel,
                            createdAt: new Date().getTime(),
                            changedAt: new Date().getTime(),
                            opacity: 1,
                        });
                        textModel.relations.push($relations[relationsLength - 1]);
                    }
                });
                $textModels = $textModels;
                $relations = $relations;
            })
            .then(() => {
                semanticalySimilarWords(textModel.text).then((words) => {
                    words.map(word => textModel.relatedWords.push([word.word , 0.5, "red"]) )
                    $relations = $relations
                });
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
        // $relations.filter(relation => relation.target.id == textModel.id).map(relation => {
        //     relation.opacity = 1;
        //     $relations = $relations
        // })
        commentFunctionDisplay = true;
    }
    function hideCommentButton() {
        event.preventDefault();
        // $relations.filter(relation => relation.target.id == textModel.id).map(relation => {
        //     relation.opacity = 0;
        //     $relations = $relations
        // })
        commentFunctionDisplay = false;
        commentFunctionActive = false;
    }
    let currentShownRelation = 0;
    function scrollToText(event) {
        event.preventDefault();
        console.log(textModel.relations);
        if (!moving && !$graphVisibility) {
            textModel.relations[currentShownRelation].source.nodes[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            currentShownRelation += 1;
            if (currentShownRelation >= textModel.relations.length) {
                currentShownRelation = 0;
            }
            clearTimeout(textModel.relationTimeout);
            textModel.relationTimeout = setTimeout(() => {
                currentShownRelation = 0;
            }, 5000);
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
    <!-- {#if !$graphVisibility}
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
    {/if} -->
</div>
