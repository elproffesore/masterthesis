import TfIdf from 'natural/lib/natural/tfidf';

// place files you want to import through the `$lib` alias in this folder.
export const posColors = {
    "Noun": "red",
    "Verb": "blue",
    "Adjective": "green",
    "Adverb": "purple",
    "Preposition": "orange",
    "Conjunction": "lime",
    "Determiner": "pink",
    "Pronoun": "brown",
}
export const colors = [
    'rgba(255,0,255,1)',
    'rgba(55, 255, 0,1)',
    'rgba(255, 255, 0,1)',
]
export const posTagBannlist = [
    "Pronoun",
];
export function nameShortener(string){
    if(string.length>20){
        return string.substring(0,20)+"...";
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
// NLP functions
export let tfidf = new TfIdf.TfIdf();
