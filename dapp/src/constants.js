import Web3 from 'web3'
import BigNumber from 'bignumber.js'

const web3 = new Web3()

export const CASE_FEE_ETHER = new BigNumber('10')
export const CHALLENGE_FEE_ETHER = new BigNumber('5')
export const CASE_FEE_WEI = new BigNumber(web3.utils.toWei(CASE_FEE_ETHER.toString(), 'ether'))
export const CHALLENGE_FEE_WEI = new BigNumber(web3.utils.toWei(CHALLENGE_FEE_ETHER.toString(), 'ether'))
export const TOTAL_ETHER = CASE_FEE_ETHER.plus(CHALLENGE_FEE_ETHER)
export const TOTAL_WEI = CASE_FEE_WEI.plus(CHALLENGE_FEE_WEI)
