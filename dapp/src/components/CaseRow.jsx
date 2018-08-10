import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight';
import { EthAddress } from '~/components/EthAddress'
import { LoadingLines } from '~/components/LoadingLines'
import { HippoTimestamp } from '~/components/HippoTimestamp'
import { txErrorMessage } from '~/services/txErrorMessage'
import { defined } from '~/utils/defined'
import * as routes from '~/config/routes'

const PENDING_TX_STATUS = -1

function mapDispatchToProps (dispatch) {
  return {
    dispatchSend: (transactionId, call, options, address) => {
      dispatch({ type: 'SEND_TRANSACTION', transactionId, call, options, address })
    },
    dispatchRemove: (transactionId) => {
      dispatch({ type: 'REMOVE_TRANSACTION', transactionId })
    }
  }
}

export const CaseRow = connect(null, mapDispatchToProps)(class _CaseRow extends Component {

  caseRowLabel = (caseRowObject, pendingTransaction) => {
    let label = 'Pending'
    const { statusLabel, error, receipt, call } = caseRowObject

    if (pendingTransaction && call) {
      const { method } = call

      if (error) {
        label = txErrorMessage(error)
      } else if (method === 'diagnoseCase' || method === 'diagnoseChallengedCase') {
        label = 'Submitting Diagnosis'
      } else if (method === 'acceptDiagnosis' || method === 'acceptAsDoctorAfterADay') {
        label = 'Accepting Diagnosis'
      } else if (method === 'challengeWithDoctor') {
        label = 'Getting Second Opinion'
      }

      if (receipt) {
        label += ' - Confirming'
      }
    } else {
      label = statusLabel
    }

    return label
  }

  caseRowLabelClass = (caseRowObject) => {
    let labelClass = 'default'
    const { error, receipt, statusClass } = caseRowObject

    if (error) {
      labelClass = 'danger'
    } else if (receipt) {
      labelClass = 'warning'
    } else if (statusClass) {
      labelClass = statusClass
    }

    return labelClass
  }

  caseRowAction(caseRowObject, pendingTransaction) {
    let options = {}
    const { caseAddress, error, call, gasUsed, transactionId } = caseRowObject

    let action = (
      <React.Fragment>
        <LoadingLines visible={true} color="#aaaaaa" />
      </React.Fragment>
    )

    if (pendingTransaction) {
      if (error) {
        if (gasUsed) {
          options['gas'] = parseInt(1.2 * gasUsed, 10)
        }

        action = (
          <button
            className="btn btn-danger btn-xs"
            onClick={(e) => {
              e.preventDefault()
              this.props.dispatchSend(transactionId, call, options, caseAddress)
            }}
          >
            Retry
          </button>
        )
      }
    } else {
      action = (
        <React.Fragment>
          <span className="case-list--item__view__text">View Case&nbsp;</span>
          <FontAwesomeIcon
            icon={faChevronCircleRight} />
        </React.Fragment>
      )
    }

    return action
  }

  render () {
    const { caseRowObject, route } = this.props

    let remove
    let { caseAddress, objIndex, error, transactionId, createdAt } = caseRowObject

    const timestamp = <HippoTimestamp timeInUtcSecondsSinceEpoch={createdAt} />

    const style = { zIndex: 998 - objIndex }
    const pendingTransaction = (
      !defined(caseRowObject.status)
      || caseRowObject.status === PENDING_TX_STATUS
    )
    const number = pendingTransaction ? '...' : (objIndex + 1)
    const path = caseAddress ? formatRoute(route, { caseAddress }) : routes.PATIENTS_CASES
    const ethAddress = caseAddress ? <EthAddress address={caseAddress} /> : null

    const action = this.caseRowAction(caseRowObject, pendingTransaction)
    const label = this.caseRowLabel(caseRowObject, pendingTransaction)
    const labelClass = this.caseRowLabelClass(caseRowObject)

    if (error) {
      remove = (
        <button
          className="btn-link text-gray"
          onClick={(e) => {
            e.preventDefault()
            this.props.dispatchRemove(transactionId)
          }}
        >
          {'\u2716'}
        </button>
      )
    }

    return (
      <Link to={path} style={style} className={classnames(
        'case-list--item',
        'list',
        { 'case-list--item__pending': pendingTransaction }
      )}>
        <span className="case-list--item__case-number text-center">
          {number}
        </span>

        <span className="case-list--item__status text-center">
          <label className={`label label-${labelClass}`}>
            {label}
          </label>
        </span>

        <span className="case-list--item__eth-address text text-left">
          {ethAddress}
          {timestamp}
        </span>

        <span className="case-list--item__view text-center">
          {action} {remove}
        </span>
      </Link>
    )
  }
})

CaseRow.propTypes = {
  route: PropTypes.string,
  caseRowObject: PropTypes.object
}
