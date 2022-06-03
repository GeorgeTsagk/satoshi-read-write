const { sendDataToAddress } = require('./write-sats')

let handlers = {}

const commandHandler = (line) => {
    const args = line.split(" ")
    if (args[0] in handlers
        && typeof (handlers[args[0]] == 'function'))
        handlers[args[0]](args)
}

handlers['speak'] = (args) => {
    if (args.length < 3) {
        console.log('Too few arguments')
        return
    }
    sendDataToAddress(args[1], args[2])
}

module.exports = {
    commandHandler
}