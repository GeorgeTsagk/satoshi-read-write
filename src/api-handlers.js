const { sendAppMessageToAddress } = require('./handle-command')

let handlers = {}

const apiHandler = (args) => {
    const replyAddress = args[0]
    args.shift()

    if (args[0] in handlers
        && (typeof handlers[args[0]]) == 'function' ) {
            handlers[args[0]](args, replyAddress)
        }
}

handlers['stablediffusion'] = (args, replyAddress) => {
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

module.exports = {
    apiHandler
}