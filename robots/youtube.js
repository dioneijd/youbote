const state = require('./state.js')
const google = require('googleapis').google
const OAuth2 = google.auth.OAuth2
const express = require('express')


async function robot(){
    const content = state.Load()

    await authenticateWithOAuth()
    // await uploadVideo()
    // await uploadThumbnail()

    async function authenticateWithOAuth(){
        const webServer = await startWebServer()
        const oAuthClient = await createOAuthClient()
        requestUserConsent(oAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(oAuthClient, authorizationToken)
        await setGlobalGoogleAuthetication(oAuthClient)
        await stopWebServer()

        async function startWebServer(){
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    console.log(`> Server listening on port ${port}`)
                })

                resolve({
                    app,
                    server
                })
            })
        }

        async function createOAuthClient(){
            const credentials = require('../credentials/google-youtube.json')

            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }

        function requestUserConsent(OAuthClient){
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/youtube'
            })

            console.log(`Please give your consent: ${consentUrl}`)
        }

        async function waitForGoogleCallback(webServer){
            return new Promise((resolve, reject) => {
                console.log('> Waiting for user consent ...')

                webServer.app.get('/oauth2callback', (req, res) => {
                    const authcode = req.query.code
                    console.log(`> Consent given: ${authcode}`)

                    res.send('<h1>Thank you!</h1><p>Now close this tab</p>')
                    resolve(authcode)
                })
            })
        }

        async function requestGoogleForAccessTokens(oAuthClient, authorizationToken){
            return new Promise((resolve, reject)=>{
                oAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if(error){
                        reject(error)
                    }

                    console.log('> Access tokens received:')
                    console.log(tokens)

                    oAuthClient.setCredentials(tokens)
                    console.log(oAuthClient)
                    resolve()
                    
                })
            })
        }

        function setGlobalGoogleAuthetication(oAuthClient){
            google.options({
                auth: oAuthClient
            })
        }

        async function stopWebServer(webServer){
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }

    }






}

module.exports = robot