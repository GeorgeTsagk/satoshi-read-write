const configLoader = require('../config/config-loader')
const { decodeDataSig, encodeDataSig } = require('./data-sig/data-sig')
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

    const dataSig = await decodeDataSig(dataSigBuf)
    console.log('sig: ', dataSig)

    let request = {
        msg: dataStructBuf,
        signature: dataSig.sig,
        pubkey: dataSig.senderPK
    };

    lightning.verifyMessage(request, function (err, response) {
        console.log(err)
        console.log(response);
    });
    // signer.verifyMessage(request, function (err, response) {
    //     console.log(err)
    //     console.log(response);
    // });

}

module.exports = {
    defaultListenHandler
}