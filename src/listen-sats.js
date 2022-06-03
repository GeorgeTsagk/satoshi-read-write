const { lightning } = require('./lnd-rpc/lightning')

const { parseCustomRecords } = require('./utils/custom-records')

const handleReceivedRecords = (handler) => {
    let request = {};
    let call = lightning.subscribeInvoices(request);
    call.on('data', function (response) {
        // A response was received from the server.
        if (response.state === "SETTLED") {
            const records = response.htlcs[0].custom_records
            handler(parseCustomRecords(records))
        }
    });
    call.on('status', function (status) {
        // The current status of the stream.
    });
    call.on('end', function () {
        // The server has closed the stream.
    });
}

module.exports = {
    handleReceivedRecords
}