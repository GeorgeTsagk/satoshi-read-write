const { sendAppMessageToAddress } = require('./handle-command')

let handlers = {}

const apiHandler = (args, senderAddress, amt) => {
    if (args[0] in handlers) {
            handler = handlers[args[0]]
            if(handler.guard(args, senderAddress, amt)
                && handler.method(args, senderAddress, amt)) {
                    return
                }
        }
}

handlers['stablediffusion'] = {
    guard: function (args, replyAddress, amt) {
        if (amt >= this.price) return true;
    },
    price: 1,
    method: function (args, replyAddress, amt) {
        args.shift()

        if (args.length == 0) {
            console.log('No stable diffusion input defined')
            return
        }
        phrase = args.join(" ")

        console.log("Calling stable difussion with phrase:", phrase)

        // **START**

        //TODO kon: call your rtx4090 in here

        //TODO kon: store your image somewhere and provide the absolute path below
        const filepath = "REPLACEME"

        // ** END **
        const buffer = fs.readFileSync(args[1])
        const filename = args[1].replace(/^.*[\\\/]/, '')

        sendAppMessageToAddress(replyAddress, 'FILE', buffer, filename)
    }
}

module.exports = {
    apiHandler
}