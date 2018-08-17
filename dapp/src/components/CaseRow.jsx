import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import { connect } from 'react-redux'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { all } from 'redux-saga/effects'
import {
  withSaga,
  cacheCallValue,
  cacheCallValueInt,
  contractByName,
  addContract,
  cacheCall
} from '~/saga-genesis'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight';
import { EthAddress } from '~/components/EthAddress'
import { LoadingLines } from '~/components/LoadingLines'
import { HippoTimestamp } from '~/components/HippoTimestamp'
import { txErrorMessage } from '~/services/txErrorMessage'
import { caseStaleForOneDay } from '~/services/caseStaleForOneDay'
import { updatePendingTx } from '~/services/pendingTxs'
import { patientCaseStatusToName, patientCaseStatusToClass } from '~/utils/patientCaseStatusLabels'
import { doctorCaseStatusToName, doctorCaseStatusToClass } from '~/utils/doctorCaseStatusLabels'
import { defined } from '~/utils/defined'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const PENDING_TX_STATUS = -1

function mapStateToProps(state, { caseRowObject, caseAddress, context, objIndex }) {
  let status, createdAt, updatedAt
  if (caseRowObject === undefined) { caseRowObject = {} }

  const transactions = Object.values(state.sagaGenesis.transactions)
  const CaseManager = contractByName(state, 'CaseManager')
  const address = get(state, 'sagaGenesis.accounts[0]')

  if (caseAddress) {
    status = cacheCallValueInt(state, caseAddress, 'status')
    createdAt = cacheCallValueInt(state, caseAddress, 'createdAt')
    updatedAt = cacheCallValueInt(state, caseAddress, 'updatedAt')

    const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')

    if (!objIndex) {
      objIndex = cacheCallValueInt(state, CaseManager, 'caseIndices', caseAddress)
    }

    if (status && objIndex && diagnosingDoctor) {
      const isFirstDoc = diagnosingDoctor === address

      caseRowObject = {
        caseAddress,
        status,
        createdAt,
        updatedAt,
        objIndex,
        isFirstDoc
      }
    }
  }


  if (context === 'patient') {
    caseRowObject['statusLabel'] = patientCaseStatusToName(status)
    caseRowObject['statusClass'] = patientCaseStatusToClass(status)
  } else {
    caseRowObject['statusLabel'] = doctorCaseStatusToName(caseRowObject)
    caseRowObject['statusClass'] = doctorCaseStatusToClass(caseRowObject)

    if (caseStaleForOneDay(caseRowObject.updatedAt, caseRowObject.status)) {
      caseRowObject['statusLabel'] = 'Requires Attention'
      caseRowObject['statusClass'] = 'warning'
    }
  }

  // If this caseRowObject has an ongoing blockchain transaction this will update
  const caseRowTransactions = transactions.filter(transaction => {
    const { call, confirmed, error, address } = transaction
    return (
      call && (!confirmed || defined(error))
        && (caseRowObject.caseAddress === address)
    )
  })

  caseRowTransactions.forEach(transaction => {
    if (caseRowObject.caseAddress === transaction.address) {
      caseRowObject = updatePendingTx(caseRowObject, transaction)
    }
  })

  return {
    CaseManager,
    caseRowObject,
    address
  }
}

function* saga({ CaseManager, caseAddress }) {
  if (!CaseManager || !caseAddress) { return }

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(caseAddress, 'createdAt'),
    cacheCall(caseAddress, 'updatedAt'),
    cacheCall(caseAddress, 'diagnosingDoctor'),
    cacheCall(CaseManager, 'caseIndices', caseAddress)
  ])
}

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

export const CaseRow = connect(mapStateToProps, mapDispatchToProps)(
  withSaga(saga)(
    class _CaseRow extends Component {

  static propTypes = {
    caseAddress: PropTypes.string,
    route: PropTypes.string,
    context: PropTypes.string.isRequired,
  }

  caseRowLabel = (caseRowObject, pendingTransaction) => {
    let label = 'Pending'
    const { statusLabel, error, receipt, call } = caseRowObject

    if (pendingTransaction && call) {
      const { method } = call

      if (error) {
        label = txErrorMessage(error)
      } else if (method === 'diagnoseCase' || method === 'diagnoseChallengedCase') {
        label = 'Submitting Diagnosis'
      } else if (method === 'acceptDiagnosis' || method === 'acceptAsDoctor') {
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
    let style = { zIndex: 950 }
    let { caseAddress, objIndex, error, transactionId, createdAt } = caseRowObject

    const timestamp = <HippoTimestamp timeInUtcSecondsSinceEpoch={createdAt} />

    if (objIndex) {
      style = { zIndex: 998 - objIndex }
    }
    const pendingTransaction = (
      !defined(caseRowObject.status)
      || caseRowObject.status === PENDING_TX_STATUS
    )
    const number = pendingTransaction ? '...' : objIndex
    const path = caseAddress ? formatRoute(route, { caseAddress }) : routes.PATIENTS_CASES
    const ethAddress = caseAddress ? <EthAddress address={caseAddress} /> : null

    const action = this.caseRowAction(caseRowObject, pendingTransaction)
    const label = this.caseRowLabel(caseRowObject, pendingTransaction)
    const labelClass = this.caseRowLabelClass(caseRowObject)

    if (error) {
      remove = (
        <button
          className="btn-link text-gray btn__remove-transaction"
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
}))
