const { decodeDataStruct } = require('./data-struct')

let buffers = {}

let completedBufferCallback = (id) => {
    dataReadyCallback(buffers[id].buffer)
    delete buffers[id]
}

let dataReadyCallback = () => {}

const setDataReadyCallback = (callback) => {
    dataReadyCallback = callback
}

const checkIfBufferComplete = (assemblyBuffer) => {
    if(assemblyBuffer.receivedBytes === assemblyBuffer.buffer.length) {
        return true
    }
    return false
}

const receiveDataStructBuffer = async (dataStructBuffer) => {
    const dataStruct = await decodeDataStruct(dataStructBuffer)
    if(dataStruct.fragment == undefined) {
        dataReadyCallback(dataStruct.payload)
    }

    if(!(dataStruct.fragment.fragmentationId in buffers)){
        console.log('Creating new buffer with id', dataStruct.fragment.fragmentationId)
        buffers[dataStruct.fragment.fragmentationId] = {
            receivedBytes: 0,
            buffer: Buffer.alloc(dataStruct.fragment.totalSize)
        }
    }

    for(let i = 0; i < dataStruct.payload.length; i++) {
        buffers[dataStruct.fragment.fragmentationId].buffer.writeUint8(
            dataStruct.payload.readUint8(i),
            dataStruct.fragment.offset + i
        )
        buffers[dataStruct.fragment.fragmentationId].receivedBytes++
    }
    console.log(
        'Fragment Received:',
        `${dataStruct.payload.length} B`,
        '|',
        buffers[dataStruct.fragment.fragmentationId].receivedBytes,
        '/',
        buffers[dataStruct.fragment.fragmentationId].buffer.length,
        'B'

    )

    if(checkIfBufferComplete(buffers[dataStruct.fragment.fragmentationId])) {
        completedBufferCallback(dataStruct.fragment.fragmentationId)
    }
}

module.exports = {
    receiveDataStructBuffer,
    setDataReadyCallback
}