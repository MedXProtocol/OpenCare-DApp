import React, { Component } from 'react'
import get from 'lodash.get'
import { connect } from 'react-redux'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faHeartbeat from '@fortawesome/fontawesome-free-solid/faHeartbeat';
import faExternalLinkAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkAlt';
import { cacheCall, withSaga, cacheCallValue, contractByName } from '~/saga-genesis'
import { EthAddress } from '~/components/EthAddress'
import { PageTitle } from '~/components/PageTitle'
import { weiToEther } from '~/utils/weiToEther'
import { EtherscanLink } from '~/components/EtherscanLink'

function mapStateToProps (state) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const WrappedEther = contractByName(state, 'WrappedEther')
  let balance = '' + cacheCallValue(state, WrappedEther, 'balanceOf', address)
  // avoid NaN
  if (balance === 'undefined')
    balance = 0

  return {
    address,
    WrappedEther,
    balance
  }
}

function* saga({ address, WrappedEther }) {
  if (!address || !WrappedEther) { return }
  yield cacheCall(WrappedEther, 'balanceOf', address)
}

export const WalletContainer = connect(mapStateToProps)(withSaga(saga)(class _Wallet extends Component {
  render() {
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.balance')} />
        <div className='container'>
          <div className="row">
            <div className="col-sm-6 col-sm-offset-3">
              <div className="card">
                <div className="card-header">
                  <h3 className="title">
                    W-ETH Balance
                    &nbsp;
                    <small>
                      <EtherscanLink address={this.props.WrappedEther}>
                        <FontAwesomeIcon
                          icon={faExternalLinkAlt} />
                      </EtherscanLink>
                    </small>
                    <br /><small className="eth-address text-gray">ethereum address: <EthAddress address={this.props.address} /></small>
                  </h3>
                </div>
                <div className="card-body">
                  <div className="form-wrapper">
                    <p className='lead text-center'>
                      <FontAwesomeIcon
                        icon={faHeartbeat} />
                      &nbsp; {weiToEther(this.props.balance)} W-ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}))
