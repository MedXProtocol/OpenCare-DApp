import React, { Component } from 'react'
import MainLayout from '../../layouts/MainLayout'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { cacheCall } from '@/saga-genesis/sagas'
import { withSaga } from '@/saga-genesis/components'
import { cacheCallValue, contractByName } from '@/saga-genesis/state-finders'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  const balance = '' + cacheCallValue(state, MedXToken, 'balanceOf', account)
  return {
    account,
    MedXToken,
    balance
  }
}

function* saga({ account, MedXToken }) {
  if (!account || !MedXToken) { return }
  yield cacheCall(MedXToken, 'balanceOf', account)
}

const Wallet = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken'] })(class _Wallet extends Component {
  render() {
    return (
      <MainLayout>
        <div className="container text-center">
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    Your Balance: {this.props.balance} MEDX
                  </h4>
                </div>
                <div className="card-body">
                  <p className='lead'>
                    For account:
                    <br /><small>{this.props.account}</small>
                  </p>
                  <p>
                    <Link to='/mint' className="btn btn-primary btn-lg">
                      Buy MEDX
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}))

export default Wallet
