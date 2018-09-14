import Web3 from 'web3'

let customWeb3

export const customProviderWeb3 = function() {
  // memoize
  if (customWeb3) {
    return customWeb3
  }

  let customProvider
  const networkId = parseInt(process.env.REACT_APP_REQUIRED_NETWORK_ID, 10)

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

  console.log('setting customWeb3 to ', customProvider)
  customWeb3 = new Web3(customProvider)

  return customWeb3
}
