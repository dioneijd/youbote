const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js')
}

async function Start(){    
    robots.input()
    await robots.text()
    
}

Start()