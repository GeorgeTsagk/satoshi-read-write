const fs = require('fs')
const { decodeAppMessage } = require('../app-protocol/app-protocol')

const handleReceivedFile = (filename, content) => {
    console.log(`Received file ${filename}`)
    fs.writeFileSync("./received_files/" + filename, content)
}

const handleReceivedText = (textBuf) => {
    console.log(textBuf.toString())
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
    }

    console.log('---------------------------------')
}

module.exports = {
    defaultDataReadyCallback
}