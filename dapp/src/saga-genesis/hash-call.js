import web3 from 'web3'

export default function (address, method, args) {
  let digest = address + method + args.join(',')
  if (web3.utils) {
    return web3.utils.sha3(digest)
  } else {
    return web3.sha3(digest)
  }
}
