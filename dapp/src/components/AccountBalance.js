import React, { Component } from 'react'
import './AccountBalance.css'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { withContractRegistry, cacheCall, cacheCallValue, withSaga } from '@/saga-genesis'
import { contractByName } from '@/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  const balance = cacheCallValue(state, MedXToken, 'balanceOf', account)
  return {
    account,
    balance,
    MedXToken
  }
}

function* saga({ account, MedXToken }) {
  if (!account || !MedXToken) { return }
  yield cacheCall(MedXToken, 'balanceOf', account)
}

const AccountBalance = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken'] })(class _AccountBalance extends Component {
    render() {
        return (
            <div className="card card-account-balance">
                <div className="card-header">
                    <div className="row">
                        <div className="col-xs-2">
                            <div className="icon-big icon-warning text-center">
                                <i className="ti-server"></i>
                            </div>
                        </div>
                        <div className="col-xs-10 text-right">
                            <h4 className="card-title">Balance</h4>
                            <p className="category">MEDX tokens balance</p>
                        </div>
                    </div>
                </div>
                <div className="card-content">
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="numbers">
                                {this.props.balance} MEDX
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})))

export default AccountBalance
