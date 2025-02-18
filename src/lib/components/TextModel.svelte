<script>
    import { onMount } from 'svelte';
    import { relations,text, textModels, nodesVisibility, timelineVisibility, graphVisibility, textCollapse, words, wordRelations } from '$lib/stores';
    import { semanticalyRelativeWordsInText, getMostRightNode, powScale, semanticalySimilarWords, createSetFromArrays, removeDuplicateObjects } from '$lib/utils';
    import winkUtils from 'wink-nlp-utils';
    import levenshtein from 'js-levenshtein';
    import winkNLP from 'wink-nlp';
    import model from 'wink-eng-lite-web-model';
    import rangy from 'rangy';
    import * as d3 from 'd3';

    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let movable = $state(true);
    let commentFunctionActive = $state(false);
    let commentFunctionDisplay = $state(false);
    let displaySameWordsInText = $state(false)
    let ranges = $state([]);

    onMount(() => {
        textModel.referenceNode = object;
        textModel.text = textModel.text.replace(/[^a-z\sA-Z]/g, '');
        textModel.referenceNode = object
        if(textModel.text.trim().split(' ').length < 5){
            retrieveRelatedWordsFromText();
        }
        $textModels = [...$textModels];
        $relations = [...$relations];
        window.addEventListener('keydown', (e) => { 
            if (e.metaKey) {
                movable = false
            }
        });
        window.addEventListener('keyup', (e) => {
            if (!e.metaKey) {
                movable = true
            }
        });
        retrieveSameWordsInText();
    });
    function retrieveSameWordsInText(){
                    // Find similar texts in source text
                    let rootElement = document.querySelector('#textWrapper');
                    let textNodes = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
                    let node;
                    ranges = [];

                    while ((node = textNodes.nextNode())) {
                        if (node.nodeValue.toLocaleLowerCase().includes(textModel.text.trim().toLocaleLowerCase()) && node.parentElement.id != textModel.nodes[0].id) {
                            let startIndex = node.nodeValue.toLocaleLowerCase().indexOf(textModel.text.trim().toLocaleLowerCase());
                            let endIndex = startIndex + textModel.text.length;
                            let range = rangy.createRange();
                            range.setStart(node, startIndex);
                            range.setEnd(node, endIndex);
                            ranges.push(range);
                        }
                    }
                    let related = [];
                    ranges.forEach((range) => {
                        let span = document.createElement('span');
                        span.classList.add('related');
                        span.classList.add('modelRef-'+textModel.id);
                        range.surroundContents(span);
                        related.push(span);
                    });
                    // Create or link model for the related texts
                    related.map((relatedNode) => {
                        let boundingClientRectText = relatedNode.getBoundingClientRect();
                        let textNode = {
                            text: relatedNode.innerText,
                            type: 'related',
                            x: boundingClientRectText.x,
                            y: boundingClientRectText.y,
                            node: relatedNode,
                            opacity: 1,
                            createdAt: new Date().getTime(),
                            changedAt: new Date().getTime(),
                        };
                        // Connect the text node with the logical node
                        let relationsLength = $relations.push({
                            source: textNode,
                            target: textModel,
                            type: 'related',
                            createdAt: new Date().getTime(),
                            changedAt: new Date().getTime(),
                            opacity: 1,
                        });
                        $relations = $relations;
                        textModel.relations.push($relations[relationsLength - 1]);
                        $textModels = $textModels;
                    });
                    d3.selectAll(`.relation-${textModel.id}.relation-related`).attr('display','none')
                }
    function toggleSameWordsInText(){
        displaySameWordsInText = !displaySameWordsInText;
        if(displaySameWordsInText){
            d3.selectAll(`.relation-${textModel.id}.relation-related`).attr('display','block')
        }else{
            d3.selectAll(`.relation-${textModel.id}.relation-related`).attr('display','none')
        }
    }
     
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
            // let corpus = Array.from(new Set(nlp.readDoc($text)
            // .tokens()
            //     .filter((t) => !t.out(its.stopWordFlag) && t.out(its.type) == 'word' && t.out(its.pos) == 'NOUN')
            //     .out()));

            // let allRelatedWords = await semanticalyRelativeWordsInText(textModel.text, corpus)
            // allRelatedWords = removeDuplicateObjects(allRelatedWords.flat());
            // allRelatedWords
            //     .filter((word) => !textModel.text.trim().split(' ').some((part) => levenshtein(part, word.word) < 5))
            //     .filter((word) => word.score != 1 && word.score > 0.35)
            //     .sort((a, b) => b.score - a.score)
            //     .slice(0, 15)
            //     .map((word) => {
            //     let node = document.querySelector('.' + word.word);
            //     if (node && word.score > 0.55) {
            //         node.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
            //         let boundingClientRectText = getMostRightNode([node]).getBoundingClientRect();
            //         let textNode = {
            //             text: word.word,
            //             x: boundingClientRectText.x,
            //             y: boundingClientRectText.y,
            //             nodes: [node],
            //             opacity: 1,
            //             createdAt: new Date().getTime(),
            //             changedAt: new Date().getTime(),
            //         };
            //         // Connect the text node with the logical node
            //         let relationsLength = $relations.push({
            //             source: textNode,
            //             target: textModel,
            //             createdAt: new Date().getTime(),
            //             changedAt: new Date().getTime(),
            //             opacity: 1,
            //         });
            //         textModel.relations.push($relations[relationsLength - 1]);
            //     }
            //     let wordRelation = $wordRelations.findIndex((wordRelation) => wordRelation.id == word.word);
            //     if (wordRelation != -1) {
            //         $wordRelations[wordRelation].relations.push({ source: textModel.text, target: word.word, score: word.score });
            //     } else {
            //         $wordRelations.push({ type: 'relation', id: word.word, relations: [{ source: textModel.text, target: word.word, score: word.score }] });
            //     }
            // });
            // let textModelDimensions = textModel.referenceNode.getBoundingClientRect();
            // $wordRelations.push({ type: 'root', id: textModel.text, node: textModel, relations: [], x: textModelDimensions.x + textModelDimensions.width / 2, fx: textModelDimensions.x + textModelDimensions.width / 2, y: textModelDimensions.y + textModelDimensions.height / 2, fy: textModelDimensions.y + textModelDimensions.height / 2 });
            // $wordRelations = [...$wordRelations];
            // $relations = [...$relations];
            //let answer = await semanticalyRelativeWordsInText(textModel.text.split(' ')[0], $words)
    }
    function onMouseDown(event) {
        if (movable) {
            event.preventDefault();
            moving = true;
        }
    }

    function onMouseUp(event) {
        if(moving){
            event.preventDefault();
            textModel.changedAt = new Date().getTime();
            moving = false;
        }

    }

    function handleDrag(event) {
        if (moving) {
            event.preventDefault();
            textModel.position[textModel.mode].x += event.movementX;
            textModel.position[textModel.mode].y += event.movementY;
            $relations = $relations;
        }
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
        $relations = [...$relations.filter((relation) => relation.target.id != textModel.id)]
        $textModels = [...$textModels.filter((model) => model.id != textModel.id)]
    }
    function pinTextModel(e){
        e.preventDefault();
        if(textModel.mode == 'free'){
            let boundingRect = textModel.referenceNode.getBoundingClientRect();
            textModel.position.fixed.y = boundingRect.top;
            textModel.position.fixed.x = textModel.position.free.x;
        }
        textModel.mode = textModel.mode == 'free' ? 'fixed' : 'free';
        $textModels = [...$textModels];
        $relations = [...$relations];
        scrollTo(0,window.scrollY+1)
    }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
<div bind:this={object} id={'textModel-' + textModel.id} class:hidden={!$nodesVisibility} class="textModel  z-[101] max-w-[300px] {textModel.mode == "free"? 'absolute': 'fixed'}" style:left={textModel.position[textModel.mode].x + 'px'} style:top={textModel.position[textModel.mode].y + 'px'} style:opacity={textModel.opacity} style:cursor={movable?'grab':'text'} onmousedown={onMouseDown} onclick={scrollToText}>
    <span class="markedText bg-primary {$textCollapse ? 'line-clamp-1' : ''}">{textModel.text}</span>
    <button class="absolute -bottom-px -right-2 h-4 z-[102] text-[8px]" onclick={toggleSameWordsInText}>{ranges.length} Links</button>
    <button class="absolute -top-px -right-2 w-4 h-4 z-[102] text-[10px]" onclick={deleteTextNode}>[x]</button>
    <button class="absolute -top-px -left-2 w-4 h-4 z-[102] text-[10px]" onclick={pinTextModel}>{textModel.mode == "free"? 'pin': 'unpin'}</button>
</div>

