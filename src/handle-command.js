const { randomBytes } = require('crypto')
const {
    sendDataToAddress,
    setDestinationAddress,
    getDestinationAddress } = require('./write-sats')
const { encodeDataSig, decodeDataSig } = require('./utils/data-sig/data-sig')
const { encodeDataStruct, decodeDataStruct, dataToDataStructArray } = require('./utils/data-struct/data-struct')

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

handlers['speak'] = (args) => {
    if (args.length < 2) {
        console.log('Specify data')
        return
    }
    const dataStructs = dataToDataStructArray(Buffer.from(args[1], 'utf-8'))

    dataStructs.forEach(
        (dataStruct) => {
            encodeDataStruct(dataStruct)
                .then((buf) => {
                    sendDataToAddress(getDestinationAddress(), buf)
                })
        }
    )


    // sendDataToAddress(args[1], Buffer.from(args[2], 'utf-8'))
}

handlers['struct'] = (args) => {
    console.log(dataToDataStructArray(
        randomBytes(32)
    ))
    // encodeDataStruct(
    //     {
    //         version: 1,
    //         payload: randomBytes(32),
    //         fragment: {
    //             fragmentationId: 42,
    //             totalSize: 32,
    //             offset: 0
    //         }
    //     }
    // ).then((res) => decodeDataStruct(res))
    // .then((ob) => console.log(ob))

}


module.exports = {
    commandHandler
}