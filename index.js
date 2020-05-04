const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    image: require('./robots/image.js')
}

async function Start(){
    // robots.input()
    // await robots.text()
    await robots.image()
    
}

Start()