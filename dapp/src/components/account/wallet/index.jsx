import React, { Component } from 'react'
import get from 'lodash.get'
import { connect } from 'react-redux'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faHeartbeat from '@fortawesome/fontawesome-free-solid/faHeartbeat';
import faExternalLinkAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkAlt';
import { cacheCall, withSaga, cacheCallValue, contractByName } from '~/saga-genesis'
import { EthAddress } from '~/components/EthAddress'
import { PageTitle } from '~/components/PageTitle'
import { EtherFlip } from '~/components/EtherFlip'
import { EtherscanLink } from '~/components/EtherscanLink'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import {
  withSend,
  TransactionStateHandler
} from '~/saga-genesis'

function mapStateToProps (state) {
  const transactions = get(state, 'sagaGenesis.transactions')
  const address = get(state, 'sagaGenesis.accounts[0]')
  const WrappedEther = contractByName(state, 'WrappedEther')
  let balance = '' + cacheCallValue(state, WrappedEther, 'balanceOf', address)
  // avoid NaN
  if (balance === 'undefined')
    balance = 0

  return {
    transactions,
    address,
    WrappedEther,
    balance
  }
}

function* saga({ address, WrappedEther }) {
  if (!address || !WrappedEther) { return }
  yield cacheCall(WrappedEther, 'balanceOf', address)
}

export const WalletContainer = connect(mapStateToProps)(withSaga(saga)(withSend(class _Wallet extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  doWithdraw = () => {
    const withdrawTransactionId = this.props.send(this.props.WrappedEther, 'withdraw', this.props.balance)()
    this.setState({
      withdrawHandler: new TransactionStateHandler(),
      withdrawTransactionId
    })
  }

  componentWillReceiveProps (props) {
    if (this.state.withdrawHandler) {
      this.state.withdrawHandler.handle(props.transactions[this.state.withdrawTransactionId])
        .onError((error) => {
          toastr.transactionError(error)
          this.setState({ withdrawHandler: null })
        })
        .onConfirmed(() => {
          this.setState({ withdrawHandler: null })
        })
        .onTxHash(() => {
          toastr.success('Withdraw successful')
          mixpanel.track('W-ETH Withdrawn')
        })
    }
  }

  render() {
    if (this.props.WrappedEther) {
      var etherscanLink =
        <EtherscanLink address={this.props.WrappedEther}>
          <FontAwesomeIcon
            icon={faExternalLinkAlt} />
        </EtherscanLink>
    }
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
                      {etherscanLink}
                    </small>
                    <br /><small className="eth-address text-gray">ethereum address: <EthAddress address={this.props.address} /></small>
                  </h3>
                </div>
                <div className="card-body">
                  <div className="form-wrapper">
                    <p className='lead text-center'>
                      <FontAwesomeIcon
                        icon={faHeartbeat} />
                      &nbsp; <EtherFlip wei={this.props.balance} />
                    </p>

                    <div className="text-center">
                      <button onClick={this.doWithdraw} className="btn btn-primary btn-lg" disabled={!!this.props.withdrawTransactionId}>
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})))
