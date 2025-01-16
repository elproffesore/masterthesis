import * as d3 from 'd3';
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
    console.log(word, words);
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
            console.log(relatedWordsJson);
            let array = Object.keys(relatedWordsJson.similarity_scores)
                .map((key) => [key, relatedWordsJson.similarity_scores[key]])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            return array;
        });
}
export function semanticalySimilarWords(words) {
    return fetch('http://localhost:8000/similar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            words: words
                .replace(/[^a-z\sA-Z]/g, '')
                .trim()
                .split(' '),
            top_n: 30,
        }),
    })
        .then((relatedWordsRequest) => relatedWordsRequest.json())
        .then((relatedWordsJson) => {
            return relatedWordsJson.similar_words.slice(0,5).map((word) => {
                return { word: word.word };
            });
        });
}
export function powScale(value, pow) {
    return d3.scalePow().exponent(pow)(value)
}
