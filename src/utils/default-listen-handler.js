const configLoader = require('../config/config-loader')
const { verifyDataSig } = require('./data-sig/data-sig')
const { signer } = require('../lnd-rpc/signer')
const { lightning } = require('../lnd-rpc/lightning')
const { receiveDataStructBuffer } = require('./data-struct/assembly-buffer')
const config = configLoader.getConfig()

const defaultListenHandler = async (records, amt) => {
    let dataSigBuf
    let dataStructBuf
    for (const key in records) {
        if (Number(key) == Number(config.data_struct.tlv_key)) {
            dataStructBuf = records[key]
        }
        if (Number(key) == Number(config.data_sig.tlv_key)) {
            dataSigBuf = records[key]
        }
    }

    const senderAddress = await verifyDataSig(dataSigBuf, dataStructBuf)
    if (senderAddress.length == 0) return
    receiveDataStructBuffer(dataStructBuf, senderAddress, amt)

}

module.exports = {
    defaultListenHandler
}