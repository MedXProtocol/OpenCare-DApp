import aesjs from 'aes-js'

export default function(ipfsHash) {
  var hashBytes = aesjs.utils.utf8.toBytes(ipfsHash)
  return aesjs.utils.hex.fromBytes(hashBytes)
}
