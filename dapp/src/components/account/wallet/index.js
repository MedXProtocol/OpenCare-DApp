import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus';
import { cacheCall } from '~/saga-genesis/sagas'
import { withSaga } from '~/saga-genesis/components'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  const balance = '' + cacheCallValue(state, MedXToken, 'balanceOf', account)
  const canMint = cacheCallValue(state, MedXToken, 'owner') === account
  return {
    account,
    MedXToken,
    balance,
    canMint
  }
}

function* saga({ account, MedXToken }) {
  if (!account || !MedXToken) { return }
  yield cacheCall(MedXToken, 'balanceOf', account)
  yield cacheCall(MedXToken, 'owner')
}

export const WalletContainer = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'MedXToken'] })(class _Wallet extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <div className="container">
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    <FontAwesomeIcon
                      icon={faPlus} />
                    &nbsp; <span className="title">Your Balance:</span> {parseInt(this.props.balance, 10).toLocaleString()} MEDX
                  </h4>
                </div>
                <div className="card-body">
                  <div className="form-wrapper">
                    <p className='lead'>
                      For account:
                      <br /><small className="eth-address text-gray">{this.props.account}</small>
                    </p>

                    {this.props.canMint &&
                      <div className="text-right">
                        <Link to='/mint' className="btn btn-primary btn-lg">
                          Buy MEDX
                        </Link>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayoutContainer>
    )
  }
}))
