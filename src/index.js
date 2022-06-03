const readline = require('readline');
const { handleReceivedRecords } = require('./listen-sats')
const { commandHandler } = require('./handle-command')

const handler = (records) => {
    console.log(records)
}

handleReceivedRecords(handler)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', function (line) {
    if (line == "exit") exit(0)
    commandHandler(line)
})