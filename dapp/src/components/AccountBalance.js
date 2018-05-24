import React, { Component } from 'react'
import './AccountBalance.css'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { withContractRegistry, cacheCallValue, withSaga } from '@/saga-genesis'

function mapStateToProps(state, { contractRegistry }) {
  const account = get(state, 'accounts[0]')
  const medXToken = contractRegistry.requireAddressByName('MedXToken')
  const balance = cacheCallValue(state, medXToken, 'balanceOf', account)
  return {
    account,
    balance
  }
}

function* saga({ account }, { cacheCall, contractRegistry }) {
  if (!account) { return }
  let medXToken = contractRegistry.requireAddressByName('MedXToken')
  yield cacheCall(medXToken, 'balanceOf', account)
}

const AccountBalance = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: 'account' })(class _AccountBalance extends Component {
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
