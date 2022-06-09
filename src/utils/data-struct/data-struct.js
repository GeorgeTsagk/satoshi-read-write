const configLoader = require('../../config/config-loader')

const config = configLoader.getConfig()

var protobuf = require("protobufjs")

const DATA_STRUCT_VERSION = 1

const dataToDataStructArray = (dataBuffer) => {
    if(dataBuffer.length > config.data_struct.max_data_size) {
        throw(`
            You are trying to transmit a file bigger than the configured max size.\n
            Transmitting data bigger than a few MB can consume big amounts of sats.\n
            If you want to execute this operation please change the maximum allowed size in the configuration file.\n`
            )
    }
    const totalSize = dataBuffer.length
    const fragmentationId = Math.floor(Math.random() * Math.pow(10, 9));
    const fragmentSize = config.data_struct.fragment_size

    let fragmentCount = Math.floor(dataBuffer.length / fragmentSize)
    if (dataBuffer.length % fragmentSize !== 0) {
        fragmentCount++
    }

    let dataStructArray = []

    for (var i = 0; i < fragmentCount; i++) {
        let tempBuf
        if (i == (fragmentCount - 1)) {
            tempBuf = dataBuffer.subarray(i * fragmentSize, totalSize)
        } else {
            tempBuf = dataBuffer.subarray(i * fragmentSize, (i + 1) * fragmentSize)
        }

        dataStructArray.push(
            {
                version: DATA_STRUCT_VERSION,
                payload: tempBuf,
                fragment: {
                    fragmentationId: fragmentationId,
                    totalSize: totalSize,
                    offset: (i * fragmentSize)
                }
            }
        )
    }

    return dataStructArray
}

const encodeDataStruct = (dataStruct) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/data-struct.proto', function (err, root) {
            if (err)
                reject(err);

            var DataStructMessage = root.lookupType("datastruct.DataStruct");

            var errMsg = DataStructMessage.verify(dataStruct);
            if (errMsg)
                reject(Error(errMsg));

            var message = DataStructMessage.create(dataStruct);

            var buffer = DataStructMessage.encode(message).finish();

            resolve(buffer)
        })
    })
}

const decodeDataStruct = (dataStructBuffer) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/data-struct.proto', function (err, root) {
            if (err)
                reject(err);

            var DataStructMessage = root.lookupType("datastruct.DataStruct");

            var message = DataStructMessage.decode(dataStructBuffer);
            var object = DataStructMessage.toObject(message, {
                longs: String,
                enums: String,
            });

            resolve(object)
        });
    })
}

module.exports = {
    encodeDataStruct,
    decodeDataStruct,
    dataToDataStructArray
}