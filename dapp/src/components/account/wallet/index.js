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
import { EthAddress } from '~/components/EthAddress'
import * as routes from '~/config/routes'
import { PageTitle } from '~/components/PageTitle'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const MedXToken = contractByName(state, 'MedXToken')
  let balance = '' + cacheCallValue(state, MedXToken, 'balanceOf', address)
  // avoid NaN
  if (balance === 'undefined')
    balance = 0

  const canMint = cacheCallValue(state, MedXToken, 'owner') === address
  return {
    address,
    MedXToken,
    balance,
    canMint
  }
}

function* saga({ address, MedXToken }) {
  if (!address || !MedXToken) { return }
  yield cacheCall(MedXToken, 'balanceOf', address)
  yield cacheCall(MedXToken, 'owner')
}

export const WalletContainer = connect(mapStateToProps)(withSaga(saga, { propTriggers: ['address', 'MedXToken'] })(class _Wallet extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <PageTitle renderTitle={(t) => t('pageTitles.balance')} />
        <div className="container">
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">
                    MEDX Balance
                    <br /><small className="eth-address text-gray">ethereum address: <EthAddress address={this.props.address} /></small>
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
