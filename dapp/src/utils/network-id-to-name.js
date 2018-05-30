export default function (networkId) {
  var networks = {
    1: 'Mainnet',
    2: 'Morden',
    3: 'Ropsten',
    4: 'Rinkeby',
    8: 'Ubiq',
    42: 'Kovan',
    1234: 'Localhost'
  }
  if (networkId) {
    var response = networks[parseInt(networkId, 10)]
  }
  if (!response) {
    response = 'Unknown'
  }
  return response
}
