import { toBN } from '~/utils/toBN'

export function etherWeiToUsdWei(etherWei, usdWeiPerEther) {
  let etherKwei = toBN(etherWei).div(toBN('1000'))
  let usdWeiPerKwei = toBN(usdWeiPerEther).div(toBN('1000000000000000'))

  return usdWeiPerKwei.mul(etherKwei)
}
