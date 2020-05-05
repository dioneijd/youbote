const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const googleSearchCredentials = require('./../credentials/google-search.json')
const imageDownloader = require('image-downloader')

const gm = require('gm').subClass({imageMagick: true})

const state = require('./state.js')

async function robot(){
    const content = state.Load()
    await fetchImagesOfAllSentences()
    await downloadAllImages()    
    await convertAllImages(content)
    await createAllSentencesImages(content)
    await createYoutubeTumbnail()
    
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

    async function convertAllImages(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await convertImage(sentenceIndex)
        }
    }

    
    async function convertImage(sentenceIndex) {
        return new Promise((resolve, reject) => {
            const inputFile = `./content/${sentenceIndex}-original.png[0]`
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const height = 1080

            console.log(inputFile)
            console.log(outputFile)

            gm()
            .in(inputFile)
            .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-blur', '0x9')
                .out('-resize', `${width}x${height}^`)
            .out(')')
            .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-resize', `${width}x${height}`)
            .out(')')
            .out('-delete', '0')
            .out('-gravity', 'center')
            .out('-compose', 'over')
            .out('-composite')
            .out('-extent', `${width}x${height}`)
            .write(outputFile, (error) => {
                if (error) {
                    return reject(error)
                }

                console.log(`> [video-robot] Image converted: ${outputFile}`)
                resolve()
            })
        })
    }

    async function createAllSentencesImages(content){

        content.sentences.forEach(async(sentence, sentenceIndex) => {
            await createSentenceImage(sentenceIndex, sentence.text)
        })
    }

    async function createSentenceImage(sentenceIndex, sentenceText){
        return new Promise((resolve, reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`

            const templateSettings = {
                0: {
                    size: '1920x400',
                    gravity: 'center'
                },
                1: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                2: {
                    size: '800x1080',
                    gravity: 'west'
                },
                3: {
                    size: '1920x400',
                    gravity: 'center'
                },
                4: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                5: {
                    size: '800x1080',
                    gravity: 'west'
                },
                6: {
                    size: '1920x400',
                    gravity: 'center'
                }
            }

            gm()
            .out('-size', templateSettings[sentenceIndex].size)
            .out('-gravity', templateSettings[sentenceIndex].gravity)
            .out('-background', 'transparent')
            .out('-fill', 'white')
            .out('-kerning', '-1')
            .out(`caption:${sentenceText}`)
            .write(outputFile, error => {
                if (error){
                    return reject(error)
                }
                resolve()
            })

        })
    }

    async function createYoutubeTumbnail(){
        return new Promise((resolve, reject) => {
            gm()
            .in('./content/0-converted.png')
            .write('./content/youtube-thumbnail.jpg', (error) => {
                if (error){
                    reject(error)
                }
                console.log('> Creating Youtube Thumbnail')
                resolve()
            })
        })
    }
}

module.exports = robot