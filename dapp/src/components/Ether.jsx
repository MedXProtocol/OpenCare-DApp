import React from 'react'
import { displayWeiToEther } from '~/utils/displayWeiToEther'

export function Ether({ wei }) {
  return (
    <React.Fragment>
      {displayWeiToEther(wei || 0)} Ξ
    </React.Fragment>
  )

}
