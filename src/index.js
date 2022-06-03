const readline = require('readline');
const configLoader = require('./config/config-loader')
const { handleReceivedRecords } = require('./listen-sats')
const { commandHandler } = require('./handle-command')

const config = configLoader.getConfig()

const listenHandler = (records) => {
    for (const key in records) {
        if (Number(key) == Number(config.data_struct.tlv_key)) {
            console.log(records[key].toString('utf-8'))
        }
    }
}

handleReceivedRecords(listenHandler)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function (line) {
    if (line == "exit") exit(0)
    commandHandler(line)
})