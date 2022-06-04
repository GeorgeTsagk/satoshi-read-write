const configLoader = require('../config/config-loader')
const { verifyDataSig } = require('./data-sig/data-sig')
const { signer } = require('../lnd-rpc/signer')
const { lightning } = require('../lnd-rpc/lightning')
const config = configLoader.getConfig()

const defaultListenHandler = async (records) => {
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

    const valid = await verifyDataSig(dataSigBuf, dataStructBuf)
    if (!valid) return
    console.log("DataSig Verified Data Received: ")
    console.log(config.data_struct.tlv_key, ':', dataStructBuf)

}

module.exports = {
    defaultListenHandler
}