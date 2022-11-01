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
    guard: (args, replyAddress, amt) => {
        if (amt >= this.price) return true;
    },
    price: 100,
    method: async (args, replyAddress, amt) => {
        args.shift()

        if (args.length == 0) {
            console.log('No stable diffusion input defined')
            return
        }
        phrase = args.join(" ")

        console.log("Calling stable difussion with phrase:", phrase)

        // **START**

        const params = {
            "enable_hr": False,
            "denoising_strength": 0,
            "firstphase_width": 0,
            "firstphase_height": 0,
            "prompt": "example prompt",
            "styles": [],
            "seed": -1,
            "subseed": -1,
            "subseed_strength": 0,
            "seed_resize_from_h": -1,
            "seed_resize_from_w": -1,
            "batch_size": 1,
            "n_iter": 1,
            "steps": 3,
            "cfg_scale": 7,
            "width": 64,
            "height": 64,
            "restore_faces": False,
            "tiling": False,
            "negative_prompt": "",
            "eta": 0,
            "s_churn": 0,
            "s_tmax": 0,
            "s_tmin": 0,
            "s_noise": 1,
            "sampler_index": "Euler a"
        }

        const options = {
            method: 'POST',
            body: JSON.stringify(params)
        }

        fetch(url, options)
            .then( response => response.json())
            .then( response => {
                console.log("Response from stablediffusion:", response)
            })

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