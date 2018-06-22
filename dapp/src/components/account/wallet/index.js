import React, { Component } from 'react'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faHeartbeat from '@fortawesome/fontawesome-free-solid/faHeartbeat';
import { cacheCall } from '~/saga-genesis/sagas'
import { withSaga } from '~/saga-genesis/components'
import { cacheCallValue, contractByName } from '~/saga-genesis/state-finders'
import * as routes from '~/config/routes'

function mapStateToProps (state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  let balance = '' + cacheCallValue(state, MedXToken, 'balanceOf', account)
  // avoid NaN
  if (balance === 'undefined')
    balance = 0

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
                    MEDX Balance
                    <br /><small className="eth-address text-gray">for account: {this.props.account}</small>
                  </h4>
                </div>
                <div className="card-body">
                  <div className="form-wrapper">
                    <p className='lead text-center'>
                      <FontAwesomeIcon
                        icon={faHeartbeat} />
                      &nbsp; {parseInt(this.props.balance, 10).toLocaleString()} MEDX
                    </p>

                    {this.props.canMint &&
                      <div className="text-right">
                        <Link to={routes.ACCOUNT_MINT} className="btn btn-primary btn-lg">
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
