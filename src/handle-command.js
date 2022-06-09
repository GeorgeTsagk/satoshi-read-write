const fs = require('fs')
const {
    sendDataToAddress,
    setDestinationAddress,
    getDestinationAddress } = require('./write-sats')
const { encodeDataSig, decodeDataSig } = require('./utils/data-sig/data-sig')
const { encodeDataStruct, decodeDataStruct, dataToDataStructArray } = require('./utils/data-struct/data-struct')

const {
    encodeAppFileMessage,
    encodeAppTextMessage,
    decodeAppMessage } = require('./app-protocol/app-protocol')

let handlers = {}

const commandHandler = (line) => {
    const args = line.split(" ")
    if (args[0] in handlers
        && typeof (handlers[args[0]] == 'function'))
        handlers[args[0]](args)
}

handlers['set'] = (args) => {
    if (args.length < 2) {
        console.log('Specify address')
        return
    }
    setDestinationAddress(args[1])
}

handlers['send'] = async (args) => {
    if (args.length < 2) {
        console.log('Specify filename')
        return
    }
    try {
        const buff = fs.readFileSync(args[1])
        const filename = args[1].replace(/^.*[\\\/]/, '')

        const appMessageBuf = await encodeAppFileMessage(filename, buff)

        const dataStructs = dataToDataStructArray(appMessageBuf)

        dataStructs.forEach(
            (dataStruct) => {
                encodeDataStruct(dataStruct)
                    .then((buf) => {
                        sendDataToAddress(getDestinationAddress(), buf)
                    })
            }
        )
    } catch (e) {
        console.log(e)
    }
}

handlers['speak'] = async (args) => {
    if (args.length < 2) {
        console.log('Specify data')
        return
    }
    args.shift()

    const appMessageBuf = await encodeAppTextMessage(args.join(" "))

    const dataStructs = dataToDataStructArray(appMessageBuf)

    dataStructs.forEach(
        (dataStruct) => {
            encodeDataStruct(dataStruct)
                .then((buf) => {
                    sendDataToAddress(getDestinationAddress(), buf)
                })
        }
    )
}

module.exports = {
    commandHandler
}