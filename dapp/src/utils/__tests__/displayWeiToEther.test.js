import Web3 from 'web3'
import { displayWeiToEther } from '../displayWeiToEther'

const web3 = new Web3()

describe('displayWeiToEther', () => {
  describe('with default decimal places', () => {
    test('will add commas and round to 4 decimals', () => {
      expect(displayWeiToEther(web3.utils.toWei('1235213.1234999', 'ether')))
        .toEqual('1,235,213.1235')
    })

    test('will still render the first zero', () => {
      expect(displayWeiToEther(web3.utils.toWei('0.1234999', 'ether')))
        .toEqual('0.1235')
    })

    test('will exclude decimals if theyre zero', () => {
      expect(displayWeiToEther(web3.utils.toWei('1200', 'ether')))
        .toEqual('1,200')
    })

    test('will safely handle null', () => {
      expect(displayWeiToEther(null)).toEqual('0')
    })

    test('will safely handle undefined', () => {
      expect(displayWeiToEther(undefined)).toEqual('0')
    })

    test('will safely handle negative numbers', () => {
      expect(displayWeiToEther(web3.utils.toWei('-1000.1234', 'ether'))).toEqual('-1,000.1234')
    })
  })

  describe('with custom decimal places', () => {
    test('will round to custom decimal places', () => {
      expect(displayWeiToEther(web3.utils.toWei('1235213.124999', 'ether'), 3))
        .toEqual('1,235,213.125')
    })
  })
})
