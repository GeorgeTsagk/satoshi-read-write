const yaml = require('js-yaml')
const fs = require('fs')
let doc
try {
    doc = yaml.load(fs.readFileSync(__dirname + '/../../config.yaml', 'utf8'));
} catch (e) {
    console.error(e);
}

const getConfig = () => {
    return doc
}

module.exports = {
    getConfig
}