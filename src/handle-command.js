let handlers = {}

const commandHandler = (line) => {
    const args = line.split(" ")
    if (args[0] in handlers
        && typeof (handlers[args[0]] == 'function'))
        handlers[args[0]](args)
}

handlers['speak'] = (args) => {
    if (args.length < 2) {
        console.log('Too few arguments')
        return
    }
    // TODO use
    console.log('sending to', args[1])
}

module.exports = {
    commandHandler
}