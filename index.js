const robots = {
    userInput: require('./robots/input.js'),
    text: require('./robots/text.js')
}

async function Start(){
    const content = {
        maximumSentences: 7
    }

    content.searchTerm = robots.userInput.AskAndReturnSearchTerm() 
    content.prefix = robots.userInput.AskAndReturnPerfix() 
    
    await robots.text(content)
   

    console.log(content.sentences)
}

Start()