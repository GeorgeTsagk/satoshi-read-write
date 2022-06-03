const { router } = require('./lnd-rpc/router')
const { lightning } = require('./lnd-rpc/lightning');
const { randomBytes, createHash } = require('crypto')
const configLoader = require('./config/config-loader')

const config = configLoader.getConfig()

const sendPayment = (address, data) => {
    const preimage = randomBytes(32)
    const hash = createHash('sha256').update(preimage).digest()

    const destBuff = Buffer.from(address, "hex");

    const dataKey = Number(config.data_struct.tlv_key)

    let records = {}
    records[5482373484] = preimage
    // records[dataKey] = Buffer.from(data, 'utf-8')
    records[dataKey] = Buffer.from(data, 'utf-8')

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
        console.log(response);
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

const sendDataToAddress = (address, data) => {
    sendPayment(address, data)
}

module.exports = {
    sendDataToAddress
}