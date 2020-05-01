const readline = require('readline-sync')

function Start(){
    const content = {}

    content.searchTerm = AskAndReturnSearchTerm() 
    content.prefix = AskAndReturnPerfix() 
    
    function AskAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function AskAndReturnPerfix() {
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes)
        const selectedPrefix = prefixes[selectedPrefixIndex]

        return selectedPrefix

    }

    console.log(content)
}

Start()