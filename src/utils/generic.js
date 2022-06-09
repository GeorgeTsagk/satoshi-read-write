const { lightning } = require('../lnd-rpc/lightning');

let myAddress = ""

const getMyAddress = () => {
    return new Promise(function(resolve, reject) {
        if (myAddress != "") {
            resolve(myAddress)
        }
        lightning.getInfo({}, function (err, response) {
            if(err) reject(err)
            if(response) resolve(response.identity_pubkey)
        });
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = {
    getMyAddress,
    sleep
}