const readline = require('readline');

const { handleReceivedRecords } = require('./listen-sats')
const { defaultListenHandler } = require('./utils/default-listen-handler')
const { commandHandler } = require('./handle-command')

handleReceivedRecords(defaultListenHandler)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function (line) {
    if (line == "exit") exit(0)
    commandHandler(line)
})