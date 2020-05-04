const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('./../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        const algorithmiaAutheticated = algorithmia.client(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAutheticated.algo('web/WikipediaParser/0.1.2?timeout=300')
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponde.get()

        content.sourceContentOrigin = wikipediaContent.content
    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOrigin)
        const withoutDatesParentheses = removeDatesParentheses(withoutBlankLinesAndMarkDown)

        content.sourceContentSanitized = withoutDatesParentheses

        function removeBlankLinesAndMarkDown(text){
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkDown = allLines.filter(line => {
                return line.trim().length === 0 || line.trim().startsWith('=') ? false : true
            })

            return withoutBlankLinesAndMarkDown.join(' ')
        }

        function removeDatesParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
        }

    }

    function breakContentIntoSentences(){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })

        })

    }
}

module.exports = robot