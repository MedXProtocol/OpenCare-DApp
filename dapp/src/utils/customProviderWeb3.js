import Web3 from 'web3'

let customWeb3
const debug = require('debug')('custom-provider-web3')

export const customProviderWeb3 = function(networkId) {
  if (customWeb3) {
    debug("using memoized")

    return customWeb3
  }

  let customProvider
  debug("networkId" + networkId)

  if (networkId === 1) {
    customProvider = process.env.REACT_APP_MAINNET_PROVIDER_URL
  } else if (networkId === 3) {
    customProvider = process.env.REACT_APP_ROPSTEN_PROVIDER_URL
  } else if (networkId === 4) {
    customProvider = process.env.REACT_APP_RINKEBY_PROVIDER_URL
  } else if (networkId === 1234) {
    customProvider = process.env.REACT_APP_LOCALHOST_PROVIDER_URL
  } else {
    customProvider = window.web3.currentProvider
    console.warn('customWeb3 set to currentProvider when should have been custom')
  }

  if (!customProvider) {
    throw new Error('*_PROVIDER_URL is undefined')
  }

  customWeb3 = new Web3(new Web3.providers.HttpProvider(customProvider))

  return customWeb3
}
