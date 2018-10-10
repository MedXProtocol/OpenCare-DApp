import React, { Component } from 'react'
import { connect } from 'react-redux'
import { all } from 'redux-saga/effects'
import { Button } from 'react-bootstrap'
import ReactTooltip from 'react-tooltip'
import { currentAccount } from '~/services/sign-in'
import get from 'lodash.get'
import {
  cacheCallValue,
  withSend,
  withSaga,
  cacheCall,
  contractByName,
  TransactionStateHandler
} from '~/saga-genesis'
import { mixpanel } from '~/mixpanel'
import { CSSTransition } from 'react-transition-group'
import { toastr } from '~/toastr'
import { InfoQuestionMark } from '~/components/InfoQuestionMark'

function mapStateToProps (state) {
  const account = currentAccount()
  if (account === null)
    return {}

  const address = get(state, 'sagaGenesis.accounts[0]')
  const AccountManager = contractByName(state, 'AccountManager')
  const DoctorManager = contractByName(state, 'DoctorManager')
  const transactions = state.sagaGenesis.transactions
  const isDoctor = cacheCallValue(state, DoctorManager, 'isDoctor', address)
  const isDermatologist = cacheCallValue(state, DoctorManager, 'isDermatologist', address)
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', address)
  const publicKeyIsDefined = publicKey !== undefined
  const publicKeyMatches = publicKey === '0x' + account.hexPublicKey()
  const isVisible = publicKeyIsDefined && !publicKeyMatches && isDoctor && isDermatologist

  return {
    account,
    address,
    AccountManager,
    DoctorManager,
    isVisible,
    transactions
  }
}

function* saga({ address, AccountManager, DoctorManager }) {
  if (!address || !AccountManager || !DoctorManager) { return }
  yield all([
    cacheCall(AccountManager, 'publicKeys', address),
    cacheCall(DoctorManager, 'isDoctor', address),
    cacheCall(DoctorManager, 'isDermatologist', address)
  ])
}

export const PublicKeyCheck = connect(mapStateToProps)(
  withSaga(saga)(withSend(class _PublicKeyCheck extends Component {
    constructor(props) {
      super(props)
      this.state = {}
    }

    handleSubmit = (e) => {
      e.preventDefault()
      const transactionId = this.props.send(
        this.props.AccountManager,
        'setPublicKey',
        this.props.account.address(),
        '0x' + currentAccount().hexPublicKey()
      )()
      this.setState({
        isSubmitting: true,
        transactionId,
        setPublicKeyHandler: new TransactionStateHandler()
      })
    }

    componentWillReceiveProps (nextProps) {
      if (this.state.setPublicKeyHandler && this.state.transactionId) {
        this.state.setPublicKeyHandler.handle(nextProps.transactions[this.state.transactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({
              isSubmitting: false
            })
          })
          .onTxHash(() => {
            toastr.success('Your account transaction has been sent.')
          })
          .onConfirmed(() => {
            toastr.success('Your account has been registered.')
            mixpanel.track('Public Key Set')
          })
      }
    }

    render() {
      return (
        <CSSTransition
          in={this.props.isVisible}
          timeout={1200}
          unmountOnExit
          classNames="slide-down"
        >
          <div id="public-key-check-banner" className="alert alert-info alert--banner alert--banner__large alert--banner__in-content text-center">
            <p>
              Your account needs to be registered
              <br className="visible-xs hidden-sm hidden-md hidden-lg" />
              &nbsp;with the Ethereum network.
              &nbsp;<InfoQuestionMark
                      name="public-key-check-info"
                      place="bottom"
                      tooltipText="This will allow you to share info with Doctors using your public key.<br />It needs to be set prior to submitting or diagnosing cases."
                    />
            </p>
            <span
              data-tip=''
              data-for='set-public-key-tooltip'>
              <Button
                disabled={this.state.isSubmitting}
                onClick={this.handleSubmit}
                bsStyle="info"
                className="btn btn-sm btn-clear">
                Register Account
              </Button>
            </span>
            <ReactTooltip
              id='set-public-key-tooltip'
              effect='solid'
              place='bottom'
              html={true}
              getContent={() => this.state.isSubmitting ? 'Setting Public Key, please wait ... <br/><small>(You may need to check MetaMask)</small>' : '' }
            />
          </div>
        </CSSTransition>
      )
    }
  }))
)
