const { router } = require('./lnd-rpc/router')
const { randomBytes, createHash } = require('crypto')
const { sleep } = require('./utils/generic')
const configLoader = require('./config/config-loader')
const { encodeAppFileMessage, encodeAppTextMessage, encodeAppApiMessage } = require('./app-protocol/app-protocol')
const { encodeDataStruct } = require('./utils/data-struct/data-struct')
const { getMyAddress } = require('./utils/generic')
const { generateDataSig, encodeDataSig } = require('./utils/data-sig/data-sig')

const config = configLoader.getConfig()

const PREIMAGE_TLV_KEY = 5482373484

let destinationAddress = ""

const setDestinationAddress = (addr) => {
    destinationAddress = addr
}

const getDestinationAddress = () => {
    return destinationAddress
}

const sendPayment = (address, dataBuffer, dataSigBuffer, amt) => {
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
        amt: amt,
        payment_hash: hash,
        payment_request: "",
        fee_limit_sat: 10,
        timeout_seconds: 15,
        dest_custom_records: records
    };

    return new Promise(function (resolve, reject) {
        let call = router.sendPaymentV2(request);
        call.on('data', function (response) {
            // A response was received from the server.
            if (response.status === 'SUCCEEDED') {
                const totalCost = Number(response.value_sat) + Number(response.fee_sat)
                resolve(totalCost)
            }
        });
        call.on('error', function (err) {
            reject(err)
        });
        call.on('status', function (status) {
            // The current status of the stream.
        });
        call.on('end', function () {
            reject()
        });
    })
}

const sendDataToAddress = async (address, data, amt) => {
    myAddress = await getMyAddress()
    return new Promise(function (resolve, reject) {
        generateDataSig(1, data, address, myAddress)
            .then((res) => encodeDataSig(res))
            .then(async (sigBuf) => {
                let cost = await sendPayment(address, data, sigBuf, amt)
                resolve(cost)
            }).catch(() => reject())
    })
}

const sendFragmentsSync = async (dataStructs, totalSum, totalCost, totalAmt) => {
    if (dataStructs.length === 0) {
        console.log('All fragments sent. Operation completed.')
        console.log('Total amount burned:', totalCost, 'sats')
        return
    }
    const dataStruct = dataStructs[0]
    let sum = totalSum
    let amt = Math.floor(totalAmt / dataStructs.length) + 1

    let prom = new Promise(async function (resolve, reject) {
        let buf = await encodeDataStruct(dataStruct)
        let cost = await sendDataToAddress(getDestinationAddress(), buf, 1).catch(() => {
            console.log('Fragment too big, SendPaymentV2 failed')
            reject()
        })
        totalCost += cost
        sum += dataStruct.payload.length
        console.log("Fragment sent for", cost, "sat(s) |",
            sum, '/', dataStruct.fragment.totalSize, 'B');
        resolve(0)
    })
    await Promise.all([prom])
    dataStructs.shift()
    sendFragmentsSync(dataStructs, sum, totalCost, totalAmt - amt)
}

let startTime = 0

const sendFragmentsAsync = async (dataStructs, workersCount, totalAmt) => {
    if (dataStructs.length === 0) {
        console.log('All fragments sent. Operation completed.')
        console.log('Total amount burned:', totalCost, 'sats')
        return
    }
    const progress = {
        totalCost: 0,
        totalSum: 0,
        amt: Math.floor(totalAmt / dataStructs.length) + 1,
    }
    startTime = ((new Date().getTime()) / 1000)
    for (let i = 0; i < workersCount; i++)
        fragmentAsyncWorker(
            dataStructs,
            progress
        )
}

const fragmentAsyncWorker = async (dataStructs, progress) => {
    if (dataStructs.length === 0) return
    const dataStruct = dataStructs.shift()
    let lastFlag = false
    if (dataStructs.length === 0) lastFlag = true

    let prom = new Promise(async function (resolve, reject) {
        let buf = await encodeDataStruct(dataStruct)
        let cost = await sendDataToAddress(getDestinationAddress(), buf, progress.amt).catch(() => {
            console.log('Fragment too big, SendPaymentV2 failed')
            reject()
        })

        progress.totalCost += cost
        progress.totalSum += dataStruct.payload.length
        console.log("Fragment sent for", cost, "sat(s) |",
            progress.totalSum, '/', dataStruct.fragment.totalSize, 'B');
        resolve(0)
    })
    await Promise.all([prom])
    if (lastFlag) {
        console.log('All fragments sent. Operation completed.')
        console.log('Total amount burned:', progress.totalCost, 'sats')
        let endTime = ((new Date().getTime()) / 1000)
        console.log('Total Time:', endTime - startTime, 'seconds')
        return
    }
    fragmentAsyncWorker(dataStructs, progress)
}


module.exports = {
    sendDataToAddress,
    setDestinationAddress,
    getDestinationAddress,
    sendFragmentsSync,
    sendFragmentsAsync
}