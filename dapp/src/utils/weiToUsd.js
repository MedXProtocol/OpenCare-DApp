import { toBN } from '~/utils/toBN'

export function weiToUsd(wei, usdPerWei) {
  wei = toBN(wei)
  usdPerWei = toBN(usdPerWei)
  return usdPerWei.mul(wei)
}
