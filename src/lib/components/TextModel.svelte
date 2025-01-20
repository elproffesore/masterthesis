<script>
    import { onMount } from 'svelte';
    import { relations, textModels, nodesVisibility, timelineVisibility, graphVisibility, textCollapse, words, wordRelations } from '$lib/stores';
    import { semanticalyRelativeWordsInText, getMostRightNode, powScale, semanticalySimilarWords, createSetFromArrays, removeDuplicateObjects, interpolatePosition } from '$lib/utils';
    import winkUtils from 'wink-nlp-utils';
    import levenshtein from 'js-levenshtein';
    import winkNLP from 'wink-nlp';
    import model from 'wink-eng-lite-web-model';
    import { text } from '@sveltejs/kit';
    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let distance = 0;
    let target = null;

    onMount(() => {
        textModel.referenceNode = object;
        textModel.text = textModel.text.replace(/[^a-z\sA-Z]/g, '');
        if (textModel.text.trim().split(' ').length < 5) {
            retrieveRelatedWordsFromText();
        }
        $textModels = [...$textModels];
        $relations = [...$relations];
        textModel.positions.push({ scroll: window.scrollY, x: textModel.x, y: textModel.y }); // Push initial Position
        window.addEventListener('scroll', () => {
            if (textModel.positions.length > 1) {
                let output = interpolatePosition(Array.from(textModel.positions), { x: textModel.x, y: textModel.y }, window.scrollY);
                textModel.x = output.x;
                textModel.y = output.y;
            }
        });
    });
    async function retrieveRelatedWordsFromText() {
        let doc = nlp.readDoc(textModel.text);
        doc = doc
            .tokens()
            .filter((t) => !t.out(its.stopWordFlag))
            .out();
        let allRelatedWords = await Promise.all(
            doc.map(async (word) => {
                let foundWords = await semanticalyRelativeWordsInText(word, $words);
                return foundWords;
            }),
        );
        allRelatedWords = removeDuplicateObjects(allRelatedWords.flat());
        allRelatedWords
            .filter((word) => !doc.some((part) => levenshtein(part, word.word) < 5))
            .filter((word) => word.score != 1 && word.score > 0.3)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
            .map((word) => {
                let node = document.querySelector('.' + word.word);
                if (node && word.score > 0.53) {
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
    function scrollToText(event) {

    }
    let displayScrollArrows = $state(false)
    function toggleScrollArrows(){
        displayScrollArrows = !displayScrollArrows;
    }
    let currentShownRelation = 0;
    function scrollUp(event){
        event.preventDefault();
        if (!moving) {
            currentShownRelation -= 1;
            if (currentShownRelation < 0) {
                currentShownRelation = textModel.relations.length - 1;
            }
            textModel.relations[currentShownRelation].source.nodes[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }
    function scrollDown(event){
        event.preventDefault();
        if (!moving) {
            currentShownRelation += 1;
            if (currentShownRelation >= textModel.relations.length) {
                currentShownRelation = 0;
            }

            textModel.relations[currentShownRelation].source.nodes[0].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }
    function onMouseDown(event) {
        target = event.target;
        event.preventDefault();
        moving = true;
    }

    function onMouseUp(event) {
        event.preventDefault();
        moving = false;
        if (distance > 5)  {
                textModel.changedAt = new Date().getTime();
                let model = textModel.positions.find((model) => Math.abs(model.scroll - window.scrollY) < 300);
                if (model) {
                    model.x = textModel.x;
                    model.y = textModel.y;
                } else {
                    textModel.positions.push({ scroll: window.scrollY, x: textModel.x, y: textModel.y });
                }
            }
        target = null;
        distance = 0;
    }

    function handleDrag(event) {
        event.preventDefault();
        if (moving) {
            distance += Math.abs(event.movementX) + Math.abs(event.movementY);
            textModel.x += event.movementX;
            textModel.y += event.movementY;
            $relations = $relations;
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
<div bind:this={object} id={'textModel-' + textModel.id} class:hidden={!$nodesVisibility} class="textModel absolute cursor-grab max-w-[300px]" style:left={textModel.x + 'px'} style:top={textModel.y + 'px'} style:opacity={textModel.opacity} draggable="true" onmouseenter="{toggleScrollArrows}" onmouseleave="{toggleScrollArrows}">
    <div class:hidden={!displayScrollArrows} onclick="{scrollUp}" class="arrow-up" style="cursor:pointer;position: absolute; top: -10px; left: 50%; transform: translateX(-50%);">
        ▲
    </div>
    <span onmousedown={onMouseDown} class="markedText {$textCollapse ? 'line-clamp-1' : ''}">{textModel.text}</span>
    <div class:hidden={!displayScrollArrows} onclick="{scrollDown}" class="arrow-up" style="cursor:pointer;position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);">
        ▼
    </div>
</div>
