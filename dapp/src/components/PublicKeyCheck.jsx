import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import ReactTooltip from 'react-tooltip'
import { currentAccount } from '~/services/sign-in'
import { cacheCallValue, withSend, withSaga, cacheCall } from '~/saga-genesis'
import { contractByName } from '~/saga-genesis/state-finders'
import { mixpanel } from '~/mixpanel'
import { TransactionStateHandler } from '~/saga-genesis/TransactionStateHandler'
import { toastr } from '~/toastr'

function mapStateToProps (state) {
  const account = currentAccount()
  if (account === null)
    return {}
  const AccountManager = contractByName(state, 'AccountManager')
  const transactions = state.sagaGenesis.transactions
  const publicKey = cacheCallValue(state, AccountManager, 'publicKeys', account.address())
  // console.log(publicKey)
  const publicKeyMatches = publicKey === '0x' + account.hexPublicKey()
  // console.log(publicKeyMatches)
  const isVisible = !publicKeyMatches
  return {
    account,
    AccountManager,
    isVisible,
    transactions
  }
}

function* saga({ account, AccountManager }) {
  if (!account || !AccountManager) { return }
  console.log(account, AccountManager)
  yield cacheCall(AccountManager, 'publicKeys', account.address())
}

export const PublicKeyCheck = connect(mapStateToProps)(
  withSaga(saga, { propTriggers: ['account', 'AccountManager'] })(withSend(class _PublicKeyCheck extends Component {
    constructor(props) {
      super(props)
      this.state = {}
    }

    handleSubmit = (e) => {
      e.preventDefault()
      const transactionId = this.props.send(
        this.props.AccountManager,
        'setPublicKey',
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
          .onReceipt(() => {
            toastr.success('Your public key was set successfully.')
            mixpanel.track('Public Key Set')
            this.setState({
              isSubmitting: false
            })
          })
      }
    }

    // unmount

    render() {
      let jsx = null
      if (this.props.isVisible) {
        jsx = (
          <div className="alert alert-info alert--banner alert--banner__large text-center">
            <p>
              Your public key needs to be confirmed on the Ethereum network prior to submitting or diagnosing cases.
            </p>
            <span
              data-tip=''
              data-for='set-public-key-tooltip'>
              <Button
                disabled={this.state.isSubmitting}
                onClick={this.handleSubmit}
                bsStyle="info"
                className="btn-sm btn-clear">
                Set Public Key
              </Button>
            </span>
            <ReactTooltip
              id='set-public-key-tooltip'
              effect='solid'
              place='right'
              getContent={() => this.state.isSubmitting ? 'Setting Public Key ... Please wait.' : 'Setting your public key allows us to encrypt your data.' } />
          </div>
        )
      }

      return jsx
    }
  }))
)
