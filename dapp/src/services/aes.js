var aes = require('aes-js')

export default {
  encrypt: function (data, key) {
    var textBytes = aes.utils.utf8.toBytes(data)
    var bytes = this.encryptBytes(textBytes, key)
    return aes.utils.hex.fromBytes(bytes)
  },

  encryptBytes: function (bytes, key) {
    var aesCtr = new aes.ModeOfOperation.ctr(key)
    return aesCtr.encrypt(bytes)
  },

  decrypt: function (cipherHex, key) {
    var cipherBytes = aes.utils.hex.toBytes(cipherHex)
    var bytes = this.decryptBytes(cipherBytes, key)
    return aes.utils.utf8.fromBytes(bytes)
  },

  decryptBytes: function (bytes, key) {
    var aesCtr = new aes.ModeOfOperation.ctr(key)
    return aesCtr.decrypt(bytes)
  }
}
