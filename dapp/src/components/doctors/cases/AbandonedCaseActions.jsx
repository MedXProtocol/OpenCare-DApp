import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types'
import { all } from 'redux-saga/effects'
import {
  contractByName,
  cacheCall,
  cacheCallValueInt,
  withSaga,
  withSend,
  TransactionStateHandler
} from '~/saga-genesis'
import { caseStale } from '~/services/caseStale'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import get from 'lodash.get'
import * as routes from '~/config/routes'

function mapStateToProps(state, { caseAddress, caseKey }) {
  const latestBlockTimestamp = get(state, 'sagaGenesis.block.latestBlock.timestamp')
  const CaseLifecycleManager = contractByName(state, 'CaseLifecycleManager')
  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')

  const transactions = state.sagaGenesis.transactions
  const status = cacheCallValueInt(state, caseAddress, 'status')
  const updatedAt = cacheCallValueInt(state, CaseScheduleManager, 'updatedAt', caseAddress)
  const secondsInADay = cacheCallValueInt(state, CaseScheduleManager, 'secondsInADay')

  return {
    CaseLifecycleManager,
    latestBlockTimestamp,
    transactions,
    status,
    updatedAt,
    secondsInADay
  }
}

function* saga({ CaseScheduleManager, caseAddress }) {
  if (!CaseScheduleManager || !caseAddress) { return }

  yield all([
    cacheCall(caseAddress, 'status'),
    cacheCall(CaseScheduleManager, 'updatedAt', caseAddress),
    cacheCall(CaseScheduleManager, 'secondsInADay')
  ])
}

const AbandonedCaseActions = connect(mapStateToProps)(withSend(withSaga(saga)(
  class _AbandonedCaseActions extends Component {

    static propTypes = {
      updatedAt: PropTypes.number,
      caseAddress: PropTypes.string,
      status: PropTypes.number
    }

    constructor(props) {
      super(props)

      this.state = {
        loading: false
      }
    }

    componentWillReceiveProps (nextProps) {
      this.forceAcceptDiagnosisHandler(nextProps)
    }

    handleForceAcceptDiagnosis = (e) => {
      e.preventDefault()

      const acceptTransactionId = this.props.send(
        this.props.CaseLifecycleManager,
        'acceptAsDoctor',
        this.props.caseAddress
      )()
      this.setState({
        acceptTransactionId,
        forceAcceptDiagnosisHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    forceAcceptDiagnosisHandler = (props) => {
      if (this.state.forceAcceptDiagnosisHandler) {
        this.state.forceAcceptDiagnosisHandler.handle(props.transactions[this.state.acceptTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ forceAcceptDiagnosisHandler: null, loading: false })
          })
          .onTxHash(() => {
            toastr.success('Your accept diagnosis transaction has been broadcast to the network. It will take a moment to be confirmed and then you will receive your fees.')
            mixpanel.track('Doctor Force Accepting After 48+ Hours')
            this.props.history.push(routes.DOCTORS_CASES_OPEN)
          })
      }
    }

    render () {
      const { updatedAt, status, secondsInADay, latestBlockTimestamp } = this.props
      if (!caseStale(updatedAt, status, 'doctor', secondsInADay, latestBlockTimestamp)
      ) {
        return null
      } else {
        return (
          <React.Fragment>
            <span
              className="abandoned-case-actions__tooltip"
              data-for="abandoned-tooltip"
              data-tip="Enough time has passed without a response from the patient.
              <br />You can close the case on their behalf to earn your MEDX:"
            >
              <Button
                disabled={this.state.loading}
                onClick={this.handleForceAcceptDiagnosis}
                className="btn btn-sm btn-success"
              >
                Get Funds
              </Button>
            </span>
            <ReactTooltip
              className="abandoned-case-actions__tooltip"
              id="abandoned-tooltip"
              html={true}
              effect='solid'
              place={'top'}
              wrapper='div'
            />
          </React.Fragment>
        )
      }
    }
  }
)))

export const AbandonedCaseActionsContainer = withRouter(AbandonedCaseActions)
