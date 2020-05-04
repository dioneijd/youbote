const readline = require('readline-sync')


function robot(content){
    
}


function AskAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia search term: ')
}

function AskAndReturnPerfix() {
    const prefixes = ['Who is', 'What is', 'The history of']
    const selectedPrefixIndex = readline.keyInSelect(prefixes)
    const selectedPrefix = prefixes[selectedPrefixIndex]

    return selectedPrefix
}


module.exports = {robot, AskAndReturnPerfix, AskAndReturnSearchTerm}