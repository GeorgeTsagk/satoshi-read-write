var protobuf = require("protobufjs")

const encodeAppFileMessage = (filename, data) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/app.proto', function (err, root) {
            if (err)
                reject(err);

            var AppMessage = root.lookupType("app.AppMessage");

            const fileMessageObj = {
                type: 1,
                data: data,
                filename: filename
            }

            var errMsg = AppMessage.verify(fileMessageObj);
            if (errMsg)
                reject(Error(errMsg));

            var message = AppMessage.create(fileMessageObj);

            var buffer = AppMessage.encode(message).finish();

            resolve(buffer)
        })
    })

}

const encodeAppTextMessage = (text) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/app.proto', function (err, root) {
            if (err)
                reject(err);

            var AppMessage = root.lookupType("app.AppMessage");

            const fileMessageObj = {
                type: 0,
                data: Buffer.from(text, 'utf-8')
            }

            var errMsg = AppMessage.verify(fileMessageObj);
            if (errMsg)
                reject(Error(errMsg));

            var message = AppMessage.create(fileMessageObj);

            var buffer = AppMessage.encode(message).finish();

            resolve(buffer)
        })
    })

}

const decodeAppMessage = (buff) => {
    return new Promise(function (resolve, reject) {
        protobuf.load(__dirname + '/app.proto', function (err, root) {
            if (err)
                reject(err);

            var AppFileMessage = root.lookupType("app.AppMessage");

            var message = AppFileMessage.decode(buff);
            var object = AppFileMessage.toObject(message, {
                longs: String,
                enums: String,
            });

            resolve(object)
        });
    })
}

module.exports = {
    encodeAppTextMessage,
    encodeAppFileMessage,
    decodeAppMessage
}
