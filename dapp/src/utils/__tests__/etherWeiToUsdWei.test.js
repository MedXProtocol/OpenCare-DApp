import BN from 'bn.js'
import Web3 from 'web3'
import { etherWeiToUsdWei } from '../etherWeiToUsdWei'

describe('etherWeiToUsdWei', () => {
  test('Will comma and round to 2 decimals', () => {
    const web3 = new Web3()

    expect(etherWeiToUsdWei('2410500000000000', web3.utils.toWei('1', 'ether')).toString())
      .toEqual('2410500000000000')

    expect(etherWeiToUsdWei('3249000000000000', web3.utils.toWei('300.52', 'ether')).toString())
      .toEqual('976389480000000000')
  })
})
