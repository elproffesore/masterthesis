import winkUtils from 'wink-nlp-utils';
import levenshtein from 'js-levenshtein';
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
                .filter((word) => word[0].length > 2 && word[0].length < 15) // remove words with a length less than 2
                .filter((word) => word[0].search(/[^a-zA-Z]/g) == -1) // remove the word itself
                .sort((a, b) => b[1] - a[1]) // sort by score
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
            return {bag,words};
        });
}