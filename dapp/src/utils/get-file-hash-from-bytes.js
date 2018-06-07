import getWeb3 from '~/get-web3'

export function getFileHashFromBytes(bytes) {
  if(!bytes || bytes === "0x")
      return null
  const web3 = getWeb3()
  return web3.utils.hexToAscii(bytes)
}
