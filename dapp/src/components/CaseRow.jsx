import ReactDOMServer from 'react-dom/server'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
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
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight'
import { AbandonedCaseActionsContainer } from '~/components/doctors/cases/AbandonedCaseActions'
import { EthAddress } from '~/components/EthAddress'
import { LoadingLines } from '~/components/LoadingLines'
import { HippoTimestamp } from '~/components/HippoTimestamp'
import { txErrorMessage } from '~/services/txErrorMessage'
import { caseStale } from '~/services/caseStale'
import { caseStatus } from '~/utils/caseStatus'
import { updatePendingTx } from '~/services/pendingTxs'
import { transactionErrorToCode } from '~/services/transactionErrorToCode'
import { patientCaseStatusToName, patientCaseStatusToClass } from '~/utils/patientCaseStatusLabels'
import { doctorCaseStatusToName, doctorCaseStatusToClass } from '~/utils/doctorCaseStatusLabels'
import { defined } from '~/utils/defined'
import get from 'lodash.get'
import * as routes from '~/config/routes'

const caseStatusToName = (caseRowObject, context) => {
  let name
  if (context === 'patient') {
    name = patientCaseStatusToName(caseRowObject)
  } else {
    name = doctorCaseStatusToName(caseRowObject)
  }

  return name
}

const caseStatusToClass = (caseRowObject, context) => {
  let cssClass
  if (context === 'patient') {
    cssClass = patientCaseStatusToClass(caseRowObject)
  } else {
    cssClass = doctorCaseStatusToClass(caseRowObject)
  }

  return cssClass
}

function mapStateToProps(state, { caseRowObject, caseAddress, context, objIndex }) {
  let status, createdAt, updatedAt, secondsInADay
  let caseIsStale = false
  if (caseRowObject === undefined) { caseRowObject = {} }

  const CaseManager = contractByName(state, 'CaseManager')
  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')

  const transactions = Object.values(state.sagaGenesis.transactions)
  const address = get(state, 'sagaGenesis.accounts[0]')

  if (caseAddress) {
    status = cacheCallValueInt(state, caseAddress, 'status')
    createdAt = cacheCallValueInt(state, CaseScheduleManager, 'createdAt', caseAddress)
    updatedAt = cacheCallValueInt(state, CaseScheduleManager, 'updatedAt', caseAddress)
    secondsInADay = cacheCallValueInt(state, CaseScheduleManager, 'secondsInADay')

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

  caseRowObject['statusLabel'] = caseStatusToName(caseRowObject, context)
  caseRowObject['statusClass'] = caseStatusToClass(caseRowObject, context)

  if (caseStale(updatedAt, status, context, secondsInADay)) {
    caseIsStale = true
  }

  // If this caseRowObject has an ongoing blockchain transaction this will update
  const reversedTransactions = transactions.reverse().filter(transaction => {
    const { call, confirmed, error } = transaction
    const caseAddress = get(transaction, 'call.args[0]')

    return (
      call
      && (
        (!confirmed && !error)
        || (error && transactionErrorToCode(error) !== 'userRevert')
      )
      && (caseRowObject.caseAddress === caseAddress)
    )
  })

  for (let i = 0; i < reversedTransactions.length; i++) {
    const caseAddress = get(reversedTransactions[i], 'call.args[0]')

    if (caseRowObject.caseAddress === caseAddress) {
      caseRowObject = updatePendingTx(caseRowObject, reversedTransactions[i])
      break
    }
  }

  return {
    CaseScheduleManager,
    CaseManager,
    caseRowObject,
    address,
    caseIsStale,
    context
  }
}

function* saga({ CaseManager, CaseScheduleManager, caseAddress }) {
  if (!CaseScheduleManager || !CaseManager || !caseAddress) { return }

  yield addContract({ address: caseAddress, contractKey: 'Case' })
  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(CaseScheduleManager, 'secondsInADay'),
    cacheCall(CaseScheduleManager, 'createdAt', caseAddress),
    cacheCall(CaseScheduleManager, 'updatedAt', caseAddress),
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
    path: PropTypes.string,
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
    const { caseRowObject, caseIsStale, context } = this.props

    let remove, label
    let style = { zIndex: 950 }
    let { caseAddress, objIndex, error, transactionId, createdAt, updatedAt } = caseRowObject

    const pendingTransaction = (
         !defined(caseRowObject.status)
      || (caseRowObject.status === caseStatus('Pending'))
    )

    const createdAtDisplay = <HippoTimestamp timeInUtcSecondsSinceEpoch={createdAt} delimiter={`<br />`} />
    const loadingOrCreatedAtTimestamp = pendingTransaction ? '...' : createdAtDisplay

    const createdAtTooltip = <HippoTimestamp timeInUtcSecondsSinceEpoch={createdAt} />
    const updatedAtTooltip = <HippoTimestamp timeInUtcSecondsSinceEpoch={updatedAt} />

    if (objIndex) {
      style = { zIndex: 901 + objIndex }
    }
    const path = this.props.path || routes.PATIENTS_CASES
    const ethAddress = caseAddress ? <EthAddress address={caseAddress} onlyAddress={true} /> : null

    const action = this.caseRowAction(caseRowObject, pendingTransaction)

    if (caseIsStale && context === 'patient') {
      caseRowObject['statusLabel'] = 'Requires Attention'
      caseRowObject['statusClass'] = 'warning'
    }


    const labelClass = this.caseRowLabelClass(caseRowObject)
    label = (
      <label className={`label label-${labelClass}`}>
        {this.caseRowLabel(caseRowObject, pendingTransaction)}
      </label>
    )

    if (
      caseRowObject.status !== caseStatus('Pending')
      && caseRowObject.isFirstDoc
      && caseIsStale
    ) {
      label = <AbandonedCaseActionsContainer caseAddress={caseAddress} />
    }

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
        <span className="case-list--item__case-date text-center">
          <span data-tip={`Created: ${ReactDOMServer.renderToStaticMarkup(createdAtTooltip)}
              ${ReactDOMServer.renderToStaticMarkup(<br/>)}
              Last Updated: ${ReactDOMServer.renderToStaticMarkup(updatedAtTooltip)}`}>
            <ReactTooltip
              html={true}
              effect='solid'
              place={'top'}
              wrapper='span'
            />
            {loadingOrCreatedAtTimestamp}
          </span>
        </span>

        <span className="case-list--item__status text-center">
          {label}
        </span>

        <span className="case-list--item__eth-address text text-left">
          {ethAddress}
        </span>

        <span className="case-list--item__view text-center">
          {action} {remove}
        </span>
      </Link>
    )
  }
}))
