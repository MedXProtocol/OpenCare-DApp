import Web3 from 'web3'
import { displayWeiToEther } from '../displayWeiToEther'

const web3 = new Web3()

describe('displayWeiToEther', () => {
  describe('with default decimal places', () => {
    it('will add commas and round to 4 decimals', () => {
      expect(displayWeiToEther(web3.utils.toWei('1235213.1234999', 'ether')))
        .toEqual('1,235,213.1235')
    })

    it('properly renders with the first decimal being zero', () => {
      expect(displayWeiToEther(web3.utils.toWei('0.0234768', 'ether')))
        .toEqual('0.0235')
    })

    it('properly renders with the first and second decimals being zero', () => {
      expect(displayWeiToEther(web3.utils.toWei('0.001837248', 'ether')))
        .toEqual('0.0018')
    })

    it('properly renders with the first and second decimals being zero and more decimalPlaces being provided', () => {
        expect(displayWeiToEther(web3.utils.toWei('0.001837248', 'ether'), 8))
          .toEqual('0.00183725')
    })

    it('will still render the first zero', () => {
      expect(displayWeiToEther(web3.utils.toWei('0.1234999', 'ether')))
        .toEqual('0.1235')
    })

    it('will exclude decimals if theyre zero', () => {
      expect(displayWeiToEther(web3.utils.toWei('1200', 'ether')))
        .toEqual('1,200')
    })

    it('will safely handle null', () => {
      expect(displayWeiToEther(null)).toEqual('0')
    })

    it('will safely handle undefined', () => {
      expect(displayWeiToEther(undefined)).toEqual('0')
    })

    it('will safely handle negative numbers', () => {
      expect(displayWeiToEther(web3.utils.toWei('-1000.1234', 'ether'))).toEqual('-1,000.1234')
    })
  })

  describe('with custom decimal places', () => {
    it('will round to custom decimal places', () => {
      expect(displayWeiToEther(web3.utils.toWei('1235213.124999', 'ether'), 3))
        .toEqual('1,235,213.125')
    })
  })
})
