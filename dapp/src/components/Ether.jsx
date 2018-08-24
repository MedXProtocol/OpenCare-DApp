import React from 'react'
import { displayWeiToEther } from '~/utils/displayWeiToEther'

export function Ether({ wei }) {
  return <span>{displayWeiToEther(wei || 0)} Ξ</span>
}
