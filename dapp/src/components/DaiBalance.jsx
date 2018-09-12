import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  withSaga,
  cacheCall,
  cacheCallValue,
  contractByName
} from '~/saga-genesis'
import { Dai } from '~/components/Dai'

function mapStateToProps(state, { address }) {
  const Dai = contractByName(state, 'Dai')
  const daiBalance = cacheCallValue(state, Dai, 'balanceOf', address)
  return {
    daiBalance,
    Dai
  }
}

function* daiBalanceSaga({ address, Dai }) {
  if (!address || !Dai) { return }
  yield cacheCall(Dai, 'balanceOf', address)
}

export const DaiBalance = connect(mapStateToProps)(
  withSaga(daiBalanceSaga)(
    function _DaiBalance({ daiBalance }){
      return (
        <Dai wei={daiBalance} />
      )
    }
  )
)
