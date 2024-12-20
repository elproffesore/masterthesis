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