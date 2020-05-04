const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('./../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

const watsonApiKey = require('./../credentials/watson-nlu.json').apikey
const naturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

var nlu = new naturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})






async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordsOfAllSentences(content)
    
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
    
    function limitMaximumSentences(){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(contente){
        for (const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }
    
    async function fetchWatsonAndReturnKeywords(sentenceText){
        return new Promise((resolve, reject) => {
            nlu.analyze(
                {
                    text: sentenceText,
                    features: {
                        keywords: {}
                    }
                },
                (error, response) => {
                    if (error) throw error
                    
                    const keywords = response.keywords.map(keyword => keyword.text)
    
                    resolve(keywords)
    
                }
              );
        })
    }
}

module.exports = robot