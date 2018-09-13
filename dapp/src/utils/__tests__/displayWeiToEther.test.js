import Web3 from 'web3'
import { displayWeiToEther } from '../displayWeiToEther'

describe('displayWeiToEther', () => {
  test('Will comma and round decimals', () => {
    const web3 = new Web3()

    expect(displayWeiToEther(web3.utils.toWei('1235213.1234999', 'ether')))
      .toEqual('1,235,213.1235')

    expect(displayWeiToEther(web3.utils.toWei('1200', 'ether')))
      .toEqual('1,200')
  })
})
