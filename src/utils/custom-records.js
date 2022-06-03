const recordKeyToNumber = (key) => {
    let number = 0;
    // const reverse = key.split("").reverse().join("")
    for (var i = 0; i < key.length; i++) {
        number += Math.pow(256, i) * key.charCodeAt(i)
    }
    return number
}

const parseCustomRecords = (custom_records) => {
    var parsed_records = {}
    for (const key in custom_records) {
        const keyNum = recordKeyToNumber(key)
        parsed_records[keyNum] = custom_records[key]
    }

    return parsed_records
}

module.exports = {
    parseCustomRecords
}