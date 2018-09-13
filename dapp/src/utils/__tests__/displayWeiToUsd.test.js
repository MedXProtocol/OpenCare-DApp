import Web3 from 'web3'
import { displayWeiToUsd } from '../displayWeiToUsd'

describe('displayWeiToUsd', () => {
  test('Will comma and round to 2 decimals', () => {
    const web3 = new Web3()
    expect(displayWeiToUsd(web3.utils.toWei('1235213.1299999', 'ether')))
      .toEqual('1,235,213.13')
    expect(displayWeiToUsd(web3.utils.toWei('1200', 'ether')))
      .toEqual('1,200')
  })
})
