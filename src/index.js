const readline = require('readline');

const { handleReceivedRecords } = require('./listen-sats')
const { setDataReadyCallback } = require('./utils/data-struct/assembly-buffer')
const { defaultDataReadyCallback } = require('./utils/default-data-ready-callback')
const { defaultListenHandler } = require('./utils/default-listen-handler')
const { commandHandler } = require('./handle-command')

handleReceivedRecords(defaultListenHandler)
setDataReadyCallback(defaultDataReadyCallback)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function (line) {
    if (line == "exit") exit(0)
    commandHandler(line)
})