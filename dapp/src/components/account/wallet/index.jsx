import React, { Component } from 'react'
import get from 'lodash.get'
import { connect } from 'react-redux'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faExternalLinkAlt from '@fortawesome/fontawesome-free-solid/faExternalLinkAlt';
import { PageTitle } from '~/components/PageTitle'
import { Dai } from '~/components/Dai'
import { EtherFlip } from '~/components/EtherFlip'
import { EtherscanLink } from '~/components/EtherscanLink'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import {
  cacheCall,
  withSaga,
  cacheCallValue,
  contractByName,
  withSend,
  TransactionStateHandler
} from '~/saga-genesis'
import oasisDirectButtonImg from '~/assets/img/oasis-direct-button.png'
import oasisDirectButtonImg2x from '~/assets/img/oasis-direct-button@2x.png'

function mapStateToProps (state) {
  const transactions = get(state, 'sagaGenesis.transactions')
  const address = get(state, 'sagaGenesis.accounts[0]')
  const WrappedEther = contractByName(state, 'WrappedEther')
  const Dai = contractByName(state, 'Dai')
  const wethBalance = cacheCallValue(state, WrappedEther, 'balanceOf', address) || '0'
  const daiBalance = cacheCallValue(state, Dai, 'balanceOf', address) || '0'

  return {
    transactions,
    address,
    WrappedEther,
    Dai,
    wethBalance,
    daiBalance
  }
}

function* saga({ address, WrappedEther, Dai }) {
  if (!address || !WrappedEther || !Dai) { return }
  yield cacheCall(WrappedEther, 'balanceOf', address)
  yield cacheCall(Dai, 'balanceOf', address)
}

export const WalletContainer = connect(mapStateToProps)(withSaga(saga)(withSend(class _Wallet extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  doWithdraw = () => {
    const withdrawTransactionId = this.props.send(this.props.WrappedEther, 'withdraw', this.props.wethBalance)()
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
      var wethEtherscanLink =
        <EtherscanLink address={this.props.WrappedEther}>
          <FontAwesomeIcon
            icon={faExternalLinkAlt} />
        </EtherscanLink>
    }

    if (this.props.Dai) {
      var daiEtherscanLink =
        <EtherscanLink address={this.props.Dai}>
          <FontAwesomeIcon
            icon={faExternalLinkAlt} />
        </EtherscanLink>
    }

    if (this.props.wethBalance > 0) {
      var withdrawWethButton =
        <React.Fragment>
          <button onClick={this.doWithdraw} className="btn btn-primary btn-lg" disabled={!!this.props.withdrawTransactionId}>
            Withdraw
          </button>
        </React.Fragment>
    }

    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.balance')} />
        <div className='container'>
          <div className='header-card card'>
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-8 col-sm-12'>
                  <h3 className="title">
                    Wallet
                  </h3>
                  <span className="sm-block text-gray">
                    <strong>View & Withdraw Balances</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="card">
                <div className="card-header">
                  <p className="lead lead--card-title">
                    W-ETH
                    &nbsp;
                    <small>
                      {wethEtherscanLink}
                    </small>
                  </p>
                  <span class="sm-block text-gray">
                    You can withdraw your W-ETH balance into regular Ether.
                    <br />
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://weth.io/"
                    >Read More About W-ETH</a>
                  </span>
                </div>
                <div className="card-body ">
                  <div className="form-wrapper">
                    <p className='lead text-center'>
                      &nbsp; <EtherFlip wei={this.props.wethBalance} />
                    </p>
                  </div>
                </div>
                <div className="card-footer text-right">
                  {withdrawWethButton}
                </div>
              </div>
            </div>

            <div className="col-sm-6">
              <div className="card">
                <div className="card-header">
                  <p className="lead lead--card-title">
                    DAI
                    &nbsp;
                    <small>
                      {daiEtherscanLink}
                    </small>
                  </p>
                  <span class="sm-block text-gray">
                    DAI is a stablecoin (1 Dai = $1 USD).
                    <br /> You can purchase DAI from&nbsp;<a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://oasis.direct/"
                    >Oasis Direct</a>
                  </span>
                </div>
                <div className="card-body">
                  <div className="form-wrapper">
                    <p className='lead text-center'>
                      &nbsp; <Dai wei={this.props.daiBalance} />
                    </p>
                  </div>
                </div>
                <div className="card-footer text-right">
                  <span data-tip={`You can purchase DAI from Oasis Direct`}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://oasis.direct/"
                    >
                      <img
                        src={oasisDirectButtonImg}
                        alt="Oasis Direct Button"
                        srcSet={`${oasisDirectButtonImg} 1x, ${oasisDirectButtonImg2x} 2x`}
                      />
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
})))
