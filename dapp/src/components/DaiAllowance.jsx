import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import BN from 'bn.js'
import classnames from 'classnames'
import { connect } from 'react-redux'
import { Dai } from '~/components/Dai'
import {
  withSend,
  withSaga,
  cacheCall,
  cacheCallValueBigNumber,
  contractByName
} from 'saga-genesis'

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

export const DaiAllowance = connect(mapStateToProps)(
  withSend(
    withSaga(daiApprovalSaga)(
      class _DaiAllowance extends Component {
        static propTypes = {
          address: PropTypes.string.isRequired,
          requiredWei: PropTypes.any.isRequired
        }

        approveWei () {
          if (!this.props.allowanceWei) {
            return new BN(0)
          } else {
            return this.props.requiredWei.sub(this.props.allowanceWei || new BN(0))
          }
        }

        render () {
          const moreWei = this.approveWei()
          const requiresMore = moreWei.gt(new BN(0))

          return (
            <span className={classnames({ 'danger': requiresMore })}>
              <Dai wei={this.props.allowanceWei} />
            </span>
          )
        }
      }
    )
  )
)
