<script>
    import { onMount } from 'svelte';
    import { relations,text, textModels, nodesVisibility, timelineVisibility, graphVisibility, textCollapse, words, wordRelations } from '$lib/stores';
    import { semanticalyRelativeWordsInText, getMostRightNode, powScale, semanticalySimilarWords, createSetFromArrays, removeDuplicateObjects } from '$lib/utils';
    import winkUtils from 'wink-nlp-utils';
    import levenshtein from 'js-levenshtein';
    import winkNLP from 'wink-nlp';
    import model from 'wink-eng-lite-web-model';
    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let commentFunctionActive = $state(false);
    let commentFunctionDisplay = $state(false);

    onMount(() => {
        textModel.referenceNode = object;
        textModel.text = textModel.text.replace(/[^a-z\sA-Z]/g, '');
        if(textModel.text.trim().split(' ').length < 5){
            retrieveRelatedWordsFromText();
        }
        $textModels = [...$textModels];
        $relations = [...$relations];
    });
    async function retrieveRelatedWordsFromText(){
        // let doc = nlp.readDoc(textModel.text);
        //     doc = doc
        //         .tokens()
        //         .filter((t) => !t.out(its.stopWordFlag))
        //         .out();
        //     let allRelatedWords = await Promise.all(
        //         doc.map(async (word) => {
        //             let foundWords = await semanticalyRelativeWordsInText(word, $words);
        //             return foundWords;
        //         }),
        //     );
            let corpus = Array.from(new Set(nlp.readDoc($text)
            .tokens()
                .filter((t) => !t.out(its.stopWordFlag) && t.out(its.type) == 'word' && t.out(its.pos) == 'NOUN')
                .out()));

            let allRelatedWords = await semanticalyRelativeWordsInText(textModel.text, corpus)
            allRelatedWords = removeDuplicateObjects(allRelatedWords.flat());
            allRelatedWords
                .filter((word) => !textModel.text.trim().split(' ').some((part) => levenshtein(part, word.word) < 5))
                .filter((word) => word.score != 1 && word.score > 0.35)
                .sort((a, b) => b.score - a.score)
                .slice(0, 15)
                .map((word) => {
                let node = document.querySelector('.' + word.word);
                if (node && word.score > 0.55) {
                    node.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                    let boundingClientRectText = getMostRightNode([node]).getBoundingClientRect();
                    let textNode = {
                        text: word.word,
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
                let wordRelation = $wordRelations.findIndex((wordRelation) => wordRelation.id == word.word);
                if (wordRelation != -1) {
                    $wordRelations[wordRelation].relations.push({ source: textModel.text, target: word.word, score: word.score });
                } else {
                    $wordRelations.push({ type: 'relation', id: word.word, relations: [{ source: textModel.text, target: word.word, score: word.score }] });
                }
            });
            let textModelDimensions = textModel.referenceNode.getBoundingClientRect();
            $wordRelations.push({ type: 'root', id: textModel.text, node: textModel, relations: [], x: textModelDimensions.x + textModelDimensions.width / 2, fx: textModelDimensions.x + textModelDimensions.width / 2, y: textModelDimensions.y + textModelDimensions.height / 2, fy: textModelDimensions.y + textModelDimensions.height / 2 });
            $wordRelations = [...$wordRelations];
            $relations = [...$relations];
            //let answer = await semanticalyRelativeWordsInText(textModel.text.split(' ')[0], $words)
    }
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
    let currentShownRelation = 0;
    function scrollToText(event) {
        // event.preventDefault();
        // if (!moving) {
        //     textModel.relations[currentShownRelation].source.nodes[0].scrollIntoView({
        //         behavior: 'smooth',
        //         block: 'center',
        //     });
        //     currentShownRelation += 1;
        //     if (currentShownRelation >= textModel.relations.length) {
        //         currentShownRelation = 0;
        //     }
        //     clearTimeout(textModel.relationTimeout);
        //     textModel.relationTimeout = setTimeout(() => {
        //         currentShownRelation = 0;
        //     }, 5000);
        // }
    }
    $effect(() => {
        if (!textModel.referenceNode.isConnected) {
            textModel.referenceNode = document.querySelector('#textModel-' + textModel.id);
        }
    });
    function deleteTextNode(e){
        e.preventDefault();
        relations.set($relations.filter((relation) => relation.target.id != textModel.id))
        let array = $wordRelations.filter((wordRelation) => wordRelation.id != textModel.text).filter((wordRelation) => wordRelation.relations.filter((relation) => relation.target == textModel.text).length == 0);
        wordRelations.set(array);
        let indexTextModel = $textModels.findIndex((model) => model.id == textModel.id);
        if(indexTextModel != -1){
            $textModels.splice(indexTextModel, 1);
            $textModels = [...$textModels];
        }

    }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
<div bind:this={object} id={'textModel-' + textModel.id} class:hidden={!$nodesVisibility} class="textModel z-[101] absolute cursor-grab max-w-[300px]" style:left={textModel.x + 'px'} style:top={textModel.y + 'px'} style:opacity={textModel.opacity} draggable="true" onmousedown={onMouseDown} onclick={scrollToText}>
    <span class="markedText {$textCollapse ? 'line-clamp-1' : ''}">{textModel.text}</span>
    <button class="absolute -top-2 -right-2 w-4 h-4 z-[102]" onclick={deleteTextNode}>x</button>
</div>

