import * as d3 from 'd3';
import winkUtils from 'wink-nlp-utils';
import levenshtein from 'js-levenshtein';
export const colors = ['rgba(255,0,255,1)', 'rgba(0, 255, 0,1)', 'rgba(255, 255, 0,1)'];
export function nameShortener(string) {
    if (string.length > 20) {
        return string.substring(0, 20) + '...';
    }
    return string;
}
export function getMostRightNode(nodes) {
    let mostRightNode = nodes[0];
    let maxRight = nodes[0].getBoundingClientRect().right;

    nodes.forEach((node) => {
        let right = node.getBoundingClientRect().right;
        if (right > maxRight) {
            maxRight = right;
            mostRightNode = node;
        }
    });

    return mostRightNode;
}
export function getMostLeftNode(nodes) {
    let mostLeftNode = nodes[0];
    let maxLeft = nodes[0].getBoundingClientRect().left;

    nodes.forEach((node) => {
        let left = node.getBoundingClientRect().left;
        if (left < maxLeft) {
            maxLeft = left;
            mostLeftNode = node;
        }
    });

    return mostLeftNode;
}

export const opacityRegex = /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9]*\.?[0-9]+)\s*\)/;

export function findSpanParentRecursive(node, level = 0) {
    // Stop recursion if the node is a space or the correct node
    if (node.nodeName == 'SPAN') {
        return node;
    }
    // Stop recursion after 3 levels
    if (level == 3) {
        return null;
    }
    // Recursively get the parent node and check if it is a span
    return findSpanParentRecursive(node.parentNode, level + 1);
}
export function semanticalyRelativeWordsInText(word, words) {
    return fetch('http://localhost:8000/similarity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            main_word: word,
            words: words,
        }),
    })
        .then((relatedWordsRequest) => relatedWordsRequest.json())
        .then((relatedWordsJson) => {
            let array = Object.keys(relatedWordsJson.similarity_scores)
                .map((key) => [key, relatedWordsJson.similarity_scores[key]])
                .sort((a, b) => b[1] - a[1])
                .filter((word) => word[1] > 0.3) // remove words with a low score
                .filter((word) => word[0].length > 2 && word[0].length < 15) // remove words with a length less than 2
                .filter((word) => word[0].search(/[^a-zA-Z]/g) == -1) // remove the word itself
                .sort((a, b) => b[1] - a[1]) // sort by score
                .slice(0, 3) // get the top 5 words
                .map((word) => {return {word: word[0], score: word[1]}});
            return array;
        });
}
export function semanticalySimilarWords(words, top_n) {
    words = words
        .trim()
        .split(' ')
        .map((word) => word.replace(/[^a-zA-Z]/g, ''))
        .map((word) => winkUtils.string.stem(word))
        .filter((word) => word.length > 1);

    return fetch('http://localhost:8000/similar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            words,
            top_n,
        }),
    })
        .then((relatedWordsRequest) => relatedWordsRequest.json())
        .then((relatedWordsJson) => {
            let similar_words = relatedWordsJson.similar_words;
            similar_words = similar_words
                .filter((word) => word.word.length > 3 && word.word.length < 15) // remove words with a length less than 2
                .filter((word) => word.word.search(/[^a-zA-Z]/g) == -1)
                .filter((word) => !/[a-z][A-Z]/.test(word.word))
                .filter((word) => !words.some((part) => levenshtein(part, word.word) < 4))
                .filter(
                    (word) =>
                        !new RegExp(String.raw`${words.toString().replaceAll(',', '|')}`, 'gi').test(
                            word.word,
                        ),
                );

            let bag = [];
            similar_words.map((word) => {
                if (!bag.some((bagWord) => levenshtein(bagWord.word, word.word) < 5)) {
                    bag.push(word);
                }
            });
            console.log(bag);
            return bag;
        });
}
export function powScale(value, pow) {
    return d3.scalePow().exponent(pow)(value);
}
