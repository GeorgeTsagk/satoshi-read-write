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

const handleReceivedApi = (textBuf) => {
    const args = textBuf.toString().split(" ")
    apiHandler(args)
}

const defaultDataReadyCallback = async (data) => {
    let appMsg
    try {
        appMsg = await decodeAppMessage(data)
    } catch (e) {
        console.log('Failed to decode app message')
    }
    console.log(`-----------DATA-READY------------`)

    switch (appMsg.type) {
        case 'TEXT':
            handleReceivedText(appMsg.data)
            break
        case 'FILE':
            handleReceivedFile(appMsg.filename, appMsg.data)
            break
        case 'API':
            handleReceivedApi(appMsg.data)
            break;
    }

    console.log('---------------------------------')
}

module.exports = {
    defaultDataReadyCallback
}