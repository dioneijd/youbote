const readline = require('readline-sync')
const state = require('./state.js')


function robot(){
    const content = {
        maximumSentences: 7
    }   

    content.searchTerm = AskAndReturnSearchTerm() 
    content.prefix = AskAndReturnPerfix()
    state.Save(content) 
    
    function AskAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }
    
    function AskAndReturnPerfix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes)
        const selectedPrefix = prefixes[selectedPrefixIndex]
    
        return selectedPrefix
    }
}




module.exports = robot