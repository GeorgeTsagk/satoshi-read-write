const configLoader = require('../config/config-loader')
const config = configLoader.getConfig()

const defaultListenHandler = (records) => {
    let dataSigBuf
    let dataStructBuf
    for (const key in records) {
        if (Number(key) == Number(config.data_struct.tlv_key)) {
            dataStructBuf == records[key]
        }
        if (Number(key) == Number(config.data_sig.tlv_key)) {
            dataSigBuf == records[key]
        }
    }
    console.log('Retrieved DataSig buf', dataSigBuf)
    console.log('Retrieved DataStruct buf', dataStructBuf)
}

module.exports = {
    defaultListenHandler
}