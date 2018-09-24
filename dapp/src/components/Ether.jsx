import React from 'react'
import classnames from 'classnames'
import { displayWeiToEther } from '~/utils/displayWeiToEther'

export function Ether({ wei, noStyle }) {
  return (
    <span className={classnames({ 'currency': !noStyle })}>
      {displayWeiToEther(wei || 0)} Ξ
    </span>
  )
}
