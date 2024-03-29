const { signer } = require('../../lnd-rpc/signer')
const { getMyAddress } = require('../../utils/generic')
var protobuf = require("protobufjs")

const generateDataSig = (version, data, destinationAddress, senderAddress) => {
    return new Promise(function (resolve, reject) {
        const destBuff = Buffer.from(destinationAddress, "hex");
        var senderBuff
        if (senderAddress !== undefined
            && typeof (senderAddress) == 'string') {
            senderBuff = Buffer.from(senderAddress, "hex");
        }

        const destDataBuffer = Buffer.concat([destBuff, data])

        let request = {
            msg: destDataBuffer,
            double_hash: false,
            compact_sig: false,
            key_loc: {
                key_family: 6,
                key_index: 0
            }
        };
        signer.signMessage(request, function (err, response) {
            if (err) {
                reject(err)
            }
            if (response) {
                let dataSig = {
                    version: version,
                    sig: response.signature
                }
                if (senderAddress !== undefined
                    && typeof senderAddress == 'string') {
                    dataSig['senderPK'] = Buffer.from(senderAddress, 'hex')
                }
                resolve(dataSig)
            }
        });
    })
}

const encodeDataSig = (dataSig) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/data-sig.proto', function (err, root) {
            if (err)
                reject(err);

            var DataSigMessage = root.lookupType("datasig.DataSig");

            var errMsg = DataSigMessage.verify(dataSig);
            if (errMsg)
                reject(Error(errMsg));

            var message = DataSigMessage.create(dataSig);

            var buffer = DataSigMessage.encode(message).finish();

            resolve(buffer)
        })
    })

}

const decodeDataSig = (dataSigBuffer) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/data-sig.proto', function (err, root) {
            if (err)
                reject(err);

            var DataSigMessage = root.lookupType("datasig.DataSig");

            var message = DataSigMessage.decode(dataSigBuffer);
            var object = DataSigMessage.toObject(message, {
                longs: String,
                enums: String,
            });

            resolve(object)
        });
    })
}

const verifyDataSig = (dataSigBuf, dataBuf) => {
    return new Promise(async function (resolve, reject) {
        const dataSig = await decodeDataSig(dataSigBuf)

        const myAddr = await getMyAddress()
        const myAddrBuf = Buffer.from(myAddr, 'hex')

        const destDataBuf = Buffer.concat([myAddrBuf, dataBuf])

        let request = {
            msg: destDataBuf,
            signature: dataSig.sig,
            pubkey: dataSig.senderPK
        };

        signer.verifyMessage(request, function (err, response) {
            if(err) reject("")
            if(response) resolve(dataSig.senderPK)
        });
    })
}


module.exports = {
    encodeDataSig,
    decodeDataSig,
    generateDataSig,
    verifyDataSig
}