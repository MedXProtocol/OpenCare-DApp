import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { Dai } from '~/components/Dai'
import { displayWeiToEther } from '~/utils/displayWeiToEther'
import {
  withSend,
  withSaga,
  cacheCall,
  cacheCallValueBigNumber,
  contractByName
} from '~/saga-genesis'

function mapStateToProps(state, { address }) {
  const Dai = contractByName(state, 'Dai')
  const CasePaymentManager = contractByName(state, 'CasePaymentManager')
  const allowanceWei = cacheCallValueBigNumber(state, Dai, 'allowance', address, CasePaymentManager)

  return {
    Dai,
    CasePaymentManager,
    allowanceWei
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

        handleApprove = (e) => {
          e.preventDefault()

          this.props.send(this.props.Dai, 'approve', this.props.CasePaymentManager, this.approveWei().toString())()
        }

        approveWei () {
          if (!this.props.allowanceWei) {
            return new BigNumber('0')
          } else {
            return this.props.requiredWei.minus(this.props.allowanceWei || '0')
          }
        }

        render () {
          const moreWei = this.approveWei()
          const requiresMore = moreWei.greaterThan('0')
          if (requiresMore) {
            var approveButton =
              <button onClick={this.handleApprove} className='btn btn-xs btn-primary'>
                Approve <Dai wei={moreWei} />
              </button>
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
