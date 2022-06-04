const { router } = require('./lnd-rpc/router')
const { lightning } = require('./lnd-rpc/lightning');
const { randomBytes, createHash } = require('crypto')
const configLoader = require('./config/config-loader')

const { generateDataSig, encodeDataSig } = require('./utils/data-sig/data-sig')

const config = configLoader.getConfig()

const PREIMAGE_TLV_KEY = 5482373484

let destinationAddress = ""
let myAddress = ""

const getMyAddress = () => {
    return new Promise(function(resolve, reject) {
        if (myAddress != "") {
            resolve(myAddress)
        }
        lightning.getInfo({}, function (err, response) {
            if(err) reject(err)
            if(response) resolve(response.identity_pubkey)
        });
    })
}

const setDestinationAddress = (addr) => {
    destinationAddress = addr
}

const getDestinationAddress = () => {
    return destinationAddress
}

const sendPayment = (address, dataBuffer, dataSigBuffer) => {
    const preimage = randomBytes(32)
    const hash = createHash('sha256').update(preimage).digest()

    const destBuff = Buffer.from(address, "hex");

    const dataKey = Number(config.data_struct.tlv_key)
    const sigKey = Number(config.data_sig.tlv_key)

    let records = {}
    records[PREIMAGE_TLV_KEY] = preimage
    records[dataKey] = dataBuffer
    if (dataSigBuffer !== undefined
        && Buffer.isBuffer(dataSigBuffer)) {
        records[sigKey] = dataSigBuffer
    }

    let request = {
        dest: destBuff,
        amt: 1,
        payment_hash: hash,
        payment_request: "",
        fee_limit_sat: 10,
        timeout_seconds: 15,
        dest_custom_records: records
    };
    let call = router.sendPaymentV2(request);
    call.on('data', function (response) {
        // A response was received from the server.
        if (response.status === 'SUCCEEDED') {
            console.log("Fragment sent for", response.value_sat, "sat(s)");
            console.log("\tDataSig sent over TLV:\t\t", sigKey)
            console.log("\tDataStruct sent over TLV:\t", dataKey)
        }
    });
    call.on('error', function (err) {
        console.error(err)
    });
    call.on('status', function (status) {
        // The current status of the stream.
    });
    call.on('end', function () {
        // The server has closed the stream.
    });
}

const sendDataToAddress = async (address, data) => {
    myAddress = await getMyAddress()
    generateDataSig(1, data, address, myAddress)
        .then((res) => encodeDataSig(res))
        .then((sigBuf) => sendPayment(
            address,
            data,
            sigBuf
        ))
}

module.exports = {
    sendDataToAddress,
    setDestinationAddress,
    getDestinationAddress
}