const { handleReceivedRecords } = require('./listen-sats')

const handler = (records) => {
    console.log(records)
}

handleReceivedRecords(handler)