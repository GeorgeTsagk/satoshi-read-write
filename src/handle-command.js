const { randomBytes } = require('crypto')
const { sendDataToAddress } = require('./write-sats')
const { encodeDataSig, decodeDataSig } = require('./utils/data-sig/data-sig')

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
    sendDataToAddress(args[1], Buffer.from(args[2], 'utf-8'))
}

handlers['sig'] = (args) => {
    encodeDataSig({
        version: 1,
        sig: randomBytes(32)
    })
    .then((res) => decodeDataSig(res))
    .then((ob) => console.log(ob))

}


module.exports = {
    commandHandler
}