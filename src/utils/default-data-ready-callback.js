const fs = require('fs')
const { decodeAppMessage } = require('../app-protocol/app-protocol')
const { apiHandler } = require('../api-handlers')

const handleReceivedFile = (filename, content) => {
    console.log(`Received file ${filename}`)
    fs.writeFileSync("./received_files/" + filename, content)
}

const handleReceivedText = (textBuf) => {
    console.log(textBuf.toString())
}

const handleReceivedApi = (text, senderAddress, amt) => {
    const args = text.toString().split(" ")
    apiHandler(args, senderAddress, amt)
}

const defaultDataReadyCallback = async (msg) => {
    let appMsg
    try {
        appMsg = await decodeAppMessage(msg.buffer)
    } catch (e) {
        console.log('Failed to decode app message')
    }
    console.log(`-----------DATA-READY------------`)

    switch (appMsg.type) {
        case 'TEXT':
            handleReceivedText(appMsg.data, msg.senderAddress, msg.amt)
            break
        case 'FILE':
            handleReceivedFile(appMsg.filename, appMsg.data, msg.senderAddress, msg.amt)
            break
        case 'API':
            handleReceivedApi(appMsg.data, msg.senderAddress, msg.amt)
            break;
    }

    console.log('---------------------------------')
}

module.exports = {
    defaultDataReadyCallback
}