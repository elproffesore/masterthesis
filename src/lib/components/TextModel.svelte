<script>
    import { onMount } from 'svelte';
    import { relations, text, textModels, nodesVisibility, timelineVisibility, graphVisibility, words, wordRelations } from '$lib/stores';
    import { semanticalyRelativeWordsInText, getMostRightNode, powScale, semanticalySimilarWords, createSetFromArrays, removeDuplicateObjects } from '$lib/utils';
    import levenshtein from 'js-levenshtein';
    import winkNLP from 'wink-nlp';
    import model from 'wink-eng-lite-web-model';
    import rangy from 'rangy';
    import { v4 as uuidv4 } from 'uuid';
    import * as d3 from 'd3';

    const nlp = winkNLP(model);
    const its = nlp.its;
    const as = nlp.as;

    let { textModel = $bindable() } = $props();
    let object;
    let moving = $state(false);
    let movable = $state(true);
    let displaySameWordsInText = $state(false);
    let ranges = $state([]);
    let resizeable = false;

    onMount(() => {
        textModel.referenceNode = object;
        textModel.text = textModel.text.replace(/[^a-z\sA-Z]/g, '');
        textModel.referenceNode = object;
        //if (textModel.text.trim().split(' ').length < 5) {
        retrieveRelatedWordsFromText();
        //}
        $textModels = [...$textModels];
        $relations = [...$relations];
        window.addEventListener('keydown', (e) => {
            if (e.metaKey) {
                movable = false;
            }

            if (menuVisibility && e.key === 's') {
                resizeable = true;
                movable = false;
            }
            if (resizeable && e.key == '+') {
                textModel.size += 1;
            }
            if (resizeable && e.key == '-') {
                textModel.size -= 1;
            }
        });
        window.addEventListener('keyup', (e) => {
            if (!e.metaKey) {
                movable = true;
            }

            if (e.key === 's') {
                resizeable = false;
                movable = true;
            }
        });
        retrieveSameWordsInText();
    });
    function retrieveSameWordsInText() {
        // Find similar texts in source text
        let rootElement = document.querySelector('#textWrapper');
        let textNodes = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null, false);
        let node;
        ranges = [];
        while ((node = textNodes.nextNode())) {
            console.log(node);
            if (node.parentElement.classList.contains('extracted')) {
                continue;
            }
            let nodeValue = node.nodeValue.toLocaleLowerCase();
            let searchText = textModel.text.trim().toLocaleLowerCase();
            let startIndex = 0;
            while ((startIndex = nodeValue.indexOf(searchText, startIndex)) !== -1) {
                let endIndex = startIndex + searchText.length;
                let range = rangy.createRange();
                range.setStart(node, startIndex);
                range.setEnd(node, endIndex);
                ranges.push(range);
                startIndex = endIndex; // Move to the end of the current match
            }
        }
        let related = [];
        ranges.forEach((range) => {
            let span = document.createElement('span');
            span.classList.add('related');
            span.classList.add('modelRef-' + textModel.id);
            span.id = uuidv4();
            span.addEventListener('click', () => {
                if (textModel.mode != 'fixed') {
                    window.scrollTo({ top: textModel.position[textModel.mode].y - window.innerHeight / 4, behavior: 'smooth' });
                }
            });
            range.surroundContents(span);
            related.push(span);
        });
        // Create or link model for the related texts
        related.map((relatedNode) => {
            let boundingClientRectText = relatedNode.getBoundingClientRect();
            let textNode = {
                id: relatedNode.id,
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
            $relations = [...$relations];
            textModel.relations.push($relations[relationsLength - 1]);
            $textModels = [...$textModels];
        });
        d3.selectAll(`.relation-${textModel.id}.relation-related`).attr('display', 'none');
    }
    function toggleSameWordsInText() {
        textModel.showRelatedWords = !textModel.showRelatedWords;
        $relations = [...$relations];
    }

    async function retrieveRelatedWordsFromText() {
        try {
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
            allRelatedWords = allRelatedWords
                .filter(
                    (word) =>
                        !textModel.text
                            .trim()
                            .split(' ')
                            .some((part) => levenshtein(part, word.word) < 5),
                )
                .filter((word) => word.score != 1 && word.score > 0.35)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);

            textModel.relatedWords = allRelatedWords;
            console.log(textModel.relatedWords);
            allRelatedWords.map((word) => {
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
        } catch (e) {
            console.log(e);
        }
    }
    function onMouseDown(event) {
        if (movable) {
            event.preventDefault();
            moving = true;
        }
    }

    function onMouseUp(event) {
        if (moving) {
            event.preventDefault();
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
    $effect(() => {
        if (textModel.referenceNode == null || !textModel.referenceNode.isConnected) {
            textModel.referenceNode = document.querySelector('#textModel-' + textModel.id);
        }
    });
    function deleteTextNode(e) {
        e.preventDefault();
        $relations = [...$relations.filter((relation) => relation.target.id != textModel.id)];
        let node;
        while ((node = document.querySelector('.related.modelRef-' + textModel.id))) {
            node.outerHTML = node.innerHTML;
        
        }
        $textModels = [...$textModels.filter((model) => model.id != textModel.id)];
    }
    function pinTextModel(e) {
        e.preventDefault();
        if (textModel.mode == 'free') {
            let boundingRect = textModel.referenceNode.getBoundingClientRect();
            textModel.position.fixed.y = boundingRect.top;
            textModel.position.fixed.x = textModel.position.free.x;
        } else {
            textModel.position.free.x = textModel.position.fixed.x;
            textModel.position.free.y = window.scrollY + textModel.position.fixed.y;
        }
        textModel.mode = textModel.mode == 'free' ? 'fixed' : 'free';
        $textModels = [...$textModels];
        $relations = [...$relations];
        scrollTo(0, window.scrollY + 1);
    }
    let textCollapse = $state(false);
    function toggleTextCollapse(e) {
        e.preventDefault();
        textCollapse = !textCollapse;
    }
    let menuVisibility = $state(false);
    function displayMenu() {
        menuVisibility = true;
    }
    function hideMenu() {
        menuVisibility = false;
    }
    function scrollToSource(e) {
        e.preventDefault();
        let boundingClientRectText = textModel.referenceNode.getBoundingClientRect();
        window.scrollTo({ top: boundingClientRectText.y, behavior: 'smooth' });
    }
</script>

<svelte:window onmouseup={onMouseUp} onmousemove={handleDrag} />
<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events,a11y_mouse_events_have_key_events -->
<div bind:this={object} id={'textModel-' + textModel.id} class:hidden={!$nodesVisibility} class="textModel z-[101] p-0 flex gap-2 {textModel.mode == 'free' ? 'absolute' : 'fixed'}" style:left={textModel.position[textModel.mode].x + 'px'} style:top={textModel.position[textModel.mode].y + 'px'} style:cursor={movable ? 'grab' : 'text'} onmousedown={onMouseDown} onmouseenter={displayMenu} onmouseleave={hideMenu}>
    <div class="flex flex-col items-baseline gap-1 max-w-[300px]">
        <span style:opacity={$timelineVisibility ? textModel.timelineOpacity : textModel.opacity} style:font-size={textModel.size + 'px'} class="markedText bg-primary {textCollapse ? 'line-clamp-1' : ''}">{textModel.text}</span>
        <button class="z-[102] text-[8px]" class:hidden={!menuVisibility} style:opacity={textModel.showRelatedWords ? 1 : 0.5} onclick={toggleSameWordsInText}>{ranges.length} Links</button>
    </div>
    <div class:hidden={!menuVisibility} class="z-[102] text-[8px] items-baseline flex flex-col gap-1 pt-[5px] {textModel.position[textModel.mode].x > window.innerWidth / 2 ? 'left-[110%]' : 'left-[0%]'}">
        <button onclick={deleteTextNode}>[x]</button>
        <button onclick={pinTextModel}>{textModel.mode == 'free' ? 'pin' : 'unpin'}</button>
        <button onclick={toggleTextCollapse}>{textCollapse ? 'spread' : 'collapse'}</button>
        <button onclick={scrollToSource}>source</button>
    </div>
</div>
