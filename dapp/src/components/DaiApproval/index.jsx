import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import BN from 'bn.js'
import { connect } from 'react-redux'
import { Dai } from '~/components/Dai'
import { LoadingLines } from '~/components/LoadingLines'
import { toastr } from '~/toastr'
import {
  withSend,
  withSaga,
  cacheCall,
  cacheCallValueBigNumber,
  contractByName,
  TransactionStateHandler
} from '~/saga-genesis'
import get from 'lodash.get'

function mapStateToProps(state, { address }) {
  const Dai = contractByName(state, 'Dai')
  const CasePaymentManager = contractByName(state, 'CasePaymentManager')
  const allowanceWei = cacheCallValueBigNumber(state, Dai, 'allowance', address, CasePaymentManager)
  const transactions = get(state, 'sagaGenesis.transactions')

  return {
    Dai,
    CasePaymentManager,
    allowanceWei,
    transactions
  }
}

function* daiApprovalSaga({ CasePaymentManager, Dai, address }) {
  if (!address || !Dai || !CasePaymentManager) { return }
  yield cacheCall(Dai, 'allowance', address, CasePaymentManager)
}

export const DaiApproval = connect(mapStateToProps)(
  withSend(
    withSaga(daiApprovalSaga)(
      class _DaiApproval extends Component {
        static propTypes = {
          address: PropTypes.string.isRequired,
          requiredWei: PropTypes.any.isRequired
        }

        constructor(props) {
          super(props)

          this.state = {
            transactionStateHandler: null
          }
        }

        componentWillReceiveProps (nextProps) {
          this.updateTxStatus(nextProps)
        }

        handleApprove = (e) => {
          e.preventDefault()

          const transactionId = this.props.send(
            this.props.Dai,
            'approve',
            this.props.CasePaymentManager,
            this.approveWei().toString()
          )()

          this.setState({
            transactionId,
            transactionStateHandler: new TransactionStateHandler()
          })
        }

        updateTxStatus = (nextProps) => {
          if (this.state.transactionStateHandler && this.state.transactionId) {
            this.state.transactionStateHandler.handle(nextProps.transactions[this.state.transactionId])
              .onError((error) => {
                toastr.transactionError(error)
                this.setState({ transactionStateHandler: null, approving: false })
              })
              .onTxHash(() => {
                toastr.success('Your DAI Approval transaction has been broadcast to the network and will take a few moments to confirm.')
                this.setState({ approving: true })
              })
              .onConfirmed(() => {
                toastr.success('Your DAI Approval has been confirmed.')
                this.setState({ transactionStateHandler: null, approving: false })
              })
          }
        }

        approveWei () {
          if (!this.props.allowanceWei) {
            return new BN('0')
          } else {
            return this.props.requiredWei.sub(this.props.allowanceWei || new BN(0))
          }
        }

        render () {
          const moreWei = this.approveWei()
          const requiresMore = moreWei.gt(new BN(0))
          if (requiresMore) {
            var approveButton =
              <React.Fragment>
                <button
                  onClick={this.handleApprove}
                  className='btn btn-xs btn-primary'
                  disabled={this.state.transactionStateHandler}
                >
                  Approve <Dai wei={moreWei} />
                </button>
                {this.state.approving ? <React.Fragment><br /><br /></React.Fragment> : null}
                <LoadingLines visible={this.state.approving} color="#aaaaaa" />
              </React.Fragment>
          }

          return (
            <span className='dai-approval'>
              {approveButton}
            </span>
          )
        }
      }
    )
  )
)
