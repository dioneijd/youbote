const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleSearchCredentials = require('./../credentials/google-search.json')
const imageDownloader = require('image-downloader')

const state = require('./state.js')

async function robot(){
    const content = state.Load()
    //await fetchImagesOfAllSentences()
    await downloadAllImages()
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

    async function downloadAllImages(){
        content.downloadedImages = []

        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images

            for (const imageUrl of images){
                
                try {
                    if (content.downloadedImages.includes(imageUrl)){
                        throw new Error('> Error: image already downloaded')
                    }

                    await downloadImageAndSave(imageUrl, `${sentenceIndex}-original.png`)                    
                    content.downloadedImages.push(imageUrl)
                    break
                } catch (error) {
                    console.log(`> error to download the image. ${error}`)
                }
            }
        }
    }

    async function downloadImageAndSave(imageUrl, fileName){
        return imageDownloader.image({
            url: imageUrl,
            dest: `./content/${fileName}`
        })
    }

}

module.exports = robot