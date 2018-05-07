var aes = require('aes-js')

export default {
  encrypt: function (data, key) {

    if (typeof data === 'string') {
      data = aes.utils.utf8.toBytes(data)
    }
    var bytes = this.encryptBytes(data, key)
    return aes.utils.hex.fromBytes(bytes)
  },

  encryptBytes: function (bytes, hexOrBytesKey) {
    if (typeof hexOrBytesKey === 'string') {
      hexOrBytesKey = aes.utils.hex.toBytes(hexOrBytesKey)
    }
    var aesCtr = new aes.ModeOfOperation.ctr(hexOrBytesKey)
    return aesCtr.encrypt(bytes)
  },

  decrypt: function (cipher, key) {
    if (typeof key === 'string') {
      key = aes.utils.hex.toBytes(key)
    }
    if (typeof cipher === 'string') {
      cipher = aes.utils.hex.toBytes(cipher)
    }
    var bytes = this.decryptBytes(cipher, key)
    return aes.utils.utf8.fromBytes(bytes)
  },

  decryptBytes: function (bytes, hexOrBytesKey) {
    if (typeof hexOrBytesKey === 'string') {
      hexOrBytesKey = aes.utils.hex.toBytes(hexOrBytesKey)
    }
    var aesCtr = new aes.ModeOfOperation.ctr(hexOrBytesKey)
    return aesCtr.decrypt(bytes)
  }
}
