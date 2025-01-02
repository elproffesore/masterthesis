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