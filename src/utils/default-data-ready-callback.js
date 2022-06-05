const defaultDataReadyCallback = (data) => {
    console.log('-----------DATA-READY------------')
    console.log(data.toString('utf8'))
    console.log('---------------------------------')
}

module.exports = {
    defaultDataReadyCallback
}