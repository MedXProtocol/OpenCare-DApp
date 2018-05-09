const generateBytes = require('./generate-bytes')

module.exports = function(ipfsHash = generateBytes(50), encryptedCaseKey = generateBytes(64)) {
  var extraData = encryptedCaseKey.concat(ipfsHash)
  var buffer = Buffer.from(extraData)
  var hexData = '0x' + buffer.toString('hex')
  return hexData
}
