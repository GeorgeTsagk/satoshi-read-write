const fs = require('fs')
const { getMyAddress } = require('./utils/generic')
const {
    sendDataToAddress,
    setDestinationAddress,
    getDestinationAddress,
    sendFragmentsSync,
    sendFragmentsAsync } = require('./write-sats')
const { encodeDataStruct, dataToDataStructArray } = require('./utils/data-struct/data-struct')
const { encodeAppFileMessage, encodeAppTextMessage, encodeAppApiMessage } = require('./app-protocol/app-protocol')
const config = require('./config/config-loader')

const conf = config.getConfig()

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
    let amt = Number(args.pop())
    if(isNaN(amt)) {
        console.log('Enter valid amount (sats) as last argument')
        return
    }

    if (args.length < 2) {
        console.log('Specify filename')
        return
    }

    sendAppMessageToAddress(getDestinationAddress(), 'FILE', fs.readFileSync(args[1]), args[1].replace(/^.*[\\\/]/, ''), amt)
}

handlers['speak'] = async (args) => {
    let amt = Number(args.pop())
    if(isNaN(amt)) {
        console.log('Enter valid amount (sats) as last argument')
        return
    }

    if (args.length < 2) {
        console.log('Specify data')
        return
    }
    args.shift()

    sendAppMessageToAddress(getDestinationAddress(), 'TEXT', args.join(" "), undefined, amt)
}

handlers['api'] = async (args) => {
    let amt = Number(args.pop())
    if(isNaN(amt)) {
        console.log('Enter valid amount (sats) as last argument')
        return
    }

    if (args.length < 2) {
        console.log('Specify reply address')
        return
    }
    args.shift()

    sendAppMessageToAddress(getDestinationAddress(), 'API', args.join(" "), undefined, amt)
}

const sendAppMessageToAddress = async (addr, type, data, filename, totalAmt) => {
    setDestinationAddress(addr)
    let dataStructs
    switch(type){
        case 'TEXT':
            try {
                const appMessageBuf = await encodeAppTextMessage(data)
                dataStructs = dataToDataStructArray(appMessageBuf)
            }catch (e) {
                console.log(e)
            }
            break;
        case 'FILE':
                try {
                    const appMessageBuf = await encodeAppFileMessage(filename, data)
                    dataStructs = dataToDataStructArray(appMessageBuf)
                } catch (e) {
                    console.log(e)
                }
            break;
        case 'API':
            try {
                const appMessageBuf = await encodeAppApiMessage(data)
                dataStructs = dataToDataStructArray(appMessageBuf)
            } catch (e) {
                console.log(e)
            }
            break;
    }

    if (conf.data_struct.fragment_workers <= 0) {
        sendFragmentsSync(dataStructs, 0, 0, totalAmt)
    } else {
        sendFragmentsAsync(
            dataStructs,
            conf.data_struct.fragment_workers,
            totalAmt
        )
    }
}

module.exports = {
    commandHandler,
    sendAppMessageToAddress
}