import Web3 from 'web3'

let _web3

export default function() {
  if (!_web3) {
    if (window && window.web3) {
      _web3 = new Web3(window.web3.currentProvider)
    } else {
      _web3 = new Web3()
    }
  }
  return _web3
}
