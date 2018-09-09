import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { all } from 'redux-saga/effects'
import {
  addContract,
  contractByName,
  cacheCall,
  cacheCallValue,
  cacheCallValueInt,
  withSaga,
  withSend,
  TransactionStateHandler
} from '~/saga-genesis'
import { caseStale } from '~/services/caseStale'
import { mapOpenCaseAddresses, openCaseAddressesSaga } from '~/services/openCasesService'
import { CSSTransition } from 'react-transition-group'
import { toastr } from '~/toastr'
import { mixpanel } from '~/mixpanel'
import get from 'lodash.get'

function mapStateToProps(state) {
  let staleCases = 0
  const address = get(state, 'sagaGenesis.accounts[0]')
  const transactions = get(state, 'sagaGenesis.transactions')
  const CaseDiagnosingDoctor = contractByName(state, 'CaseDiagnosingDoctor')
  const CaseScheduleManager = contractByName(state, 'CaseScheduleManager')
  const CaseStatusManager = contractByName(state, 'CaseStatusManager')

  const openAddresses = mapOpenCaseAddresses(state, CaseStatusManager, address)

  openAddresses.forEach(caseAddress => {
    const secondsInADay = cacheCallValueInt(state, CaseScheduleManager, 'secondsInADay')
    const status = cacheCallValueInt(state, caseAddress, 'status')
    const updatedAt = cacheCallValueInt(state, CaseScheduleManager, 'updatedAt', caseAddress)
    const diagnosingDoctor = cacheCallValue(state, caseAddress, 'diagnosingDoctor')
    const isFirstDoc = diagnosingDoctor === address

    if (isFirstDoc && caseStale(updatedAt, status, 'doctor', secondsInADay)) {
      staleCases++
    }
  })

  return {
    CaseDiagnosingDoctor,
    address,
    staleCases,
    transactions
  }
}

function* saga({ address, CaseStatusManager, CaseScheduleManager }) {
  if (!address || !CaseStatusManager || !CaseScheduleManager) { return }

  const openAddresses = yield openCaseAddressesSaga(CaseStatusManager, address)

  yield all(openAddresses.map(function* (caseAddress) {
    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield all([
      cacheCall(CaseScheduleManager, 'secondsInADay'),
      cacheCall(CaseScheduleManager, 'updatedAt', caseAddress),
      cacheCall(caseAddress, 'status'),
      cacheCall(caseAddress, 'diagnosingDoctor')
    ])
  }))
}

export const AcceptAllExpiredCases = connect(mapStateToProps)(withSend(withSaga(saga)(
  class _AcceptAllExpiredCases extends Component {

    constructor(props) {
      super(props)

      this.state = {
        isVisible: true,
        loading: false
      }
    }

    componentWillReceiveProps (nextProps) {
      this.forceAcceptAllAsDoctorHandler(nextProps)
    }

    handleAcceptAllAsDoctorHandler = (e) => {
      e.preventDefault()

      const acceptAllAsDoctorTransactionId = this.props.send(
        this.props.CaseDiagnosingDoctor,
        'acceptAllAsDoctor'
      )()
      this.setState({
        acceptAllAsDoctorTransactionId,
        forceAcceptAllAsDoctorHandler: new TransactionStateHandler(),
        loading: true
      })
    }

    forceAcceptAllAsDoctorHandler = (props) => {
      if (this.state.forceAcceptAllAsDoctorHandler) {
        this.state.forceAcceptAllAsDoctorHandler.handle(props.transactions[this.state.acceptAllAsDoctorTransactionId])
          .onError((error) => {
            toastr.transactionError(error)
            this.setState({ forceAcceptAllAsDoctorHandler: null, loading: false, isVisible: true })
          })
          .onConfirmed(() => {
            this.setState({ forceAcceptAllAsDoctorHandler: null, loading: false, isVisible: true })
          })
          .onTxHash(() => {
            toastr.success('Your "Accept all Diagnoses on Stale Cases" transaction has been broadcast to the network. After it confirms you will receive your fees.')
            mixpanel.track('Doctor Force Accepting All Stale Cases')
            this.setState({ isVisible: false })
          })
      }
    }

    render () {
      const { staleCases } = this.props
      const visible = this.state.isVisible && (staleCases > 1)

      return (
        <CSSTransition
          in={visible}
          timeout={1200}
          unmountOnExit
          classNames="slide-down"
        >
          <div className="alert alert-info alert--banner alert--banner__large alert--banner__in-content text-center">
            <p>
              <strong>{staleCases}</strong> cases had no response.
              <br className="visible-xs hidden-sm hidden-md hidden-lg" />
              &nbsp;You can close them to earn your fees:

              <br />
              <Button
                disabled={this.state.loading}
                onClick={this.handleAcceptAllAsDoctorHandler}
                bsStyle="info"
                className="btn btn-sm btn-clear"
              >
                Get All Funds
              </Button>
            </p>
          </div>
        </CSSTransition>
      )
    }

  }
)))
