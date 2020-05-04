const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleSearchCredentials = require('./../credentials/google-search.json')

const state = require('./state.js')

async function robot(){
    const content = state.Load()
    await fetchImagesOfAllSentences()
    state.Save(content)

    async function fetchImagesOfAllSentences(){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(queryText){
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: queryText,
            searchType: 'image',
            //imgSize: 'huge',
            num: 2
        })

        const imageUrl = response.data.items.map( item => item.link )

        return imageUrl
    }

}

module.exports = robot