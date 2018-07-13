import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FlipMove from 'react-flip-move'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { CaseRowContainer } from '~/components/CaseRow'
import { contractByName } from '~/saga-genesis/state-finders'
import { addContract } from '~/saga-genesis/sagas'
import get from 'lodash.get'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import * as routes from '~/config/routes'

function mapStateToProps(state, { accounts }) {
  const cases = []
  const account = get(state, 'sagaGenesis.accounts[0]')
  const CaseManager = contractByName(state, 'CaseManager')
  const AccountManager = contractByName(state, 'AccountManager')
  const caseCount = cacheCallValue(state, CaseManager, 'getPatientCaseListCount', account)

  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = cacheCallValue(state, CaseManager, 'patientCases', account, caseIndex)
    if (caseAddress) {
      let status = cacheCallValue(state, caseAddress, 'status')
      cases.push({
        caseAddress,
        status,
        caseIndex
      })
    }
  }

  return {
    account,
    caseCount,
    cases,
    CaseManager,
    AccountManager
  }
}

function mapDispatchToProps (dispatch) {
  return {
    invalidate: (address) => dispatch({type: 'CACHE_INVALIDATE_ADDRESS', address})
  }
}

function* saga({ account, CaseManager, AccountManager }) {
  if (!account || !CaseManager) { return }
  let caseCount = yield cacheCall(CaseManager, 'getPatientCaseListCount', account)
  for (let caseIndex = (caseCount - 1); caseIndex >= 0; --caseIndex) {
    let caseAddress = yield cacheCall(CaseManager, 'patientCases', account, caseIndex)
    yield addContract({ address: caseAddress, contractKey: 'Case' })
    yield cacheCall(caseAddress, 'status')
  }
}

export const PatientCases = withContractRegistry(connect(mapStateToProps, mapDispatchToProps)(withSaga(saga, { propTriggers: ['account', 'CaseManager', 'AccountManager', 'caseCount']})(class _PatientCases extends Component {
  constructor(props) {
    super(props)
    this.state = {
      cases: []
    }
  }

  componentDidMount () {
    this.props.invalidate(this.props.CaseManager)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      cases: [...nextProps.cases]
    })
  }

  handleAddCase = () => {
    const cases = [...this.state.cases]
    const statuses = [
      0,
      1,
      3,
      4,
      5,
      6,
      8,
      10,
      11
    ]
    cases.splice(0, 0, {
      caseAddress: '0xn3wC4s3',
      status: statuses[parseInt(Math.random() * statuses.length, 10)],
      caseIndex: this.state.cases.length
    });
    this.setState({
      cases: cases
    })
  }

  render() {
    return (
      <div className="card">
        <div className="card-body table-responsive">
          <a onClick={this.handleAddCase} className="btn btn-primary btn-lg">Add Case</a>
          <br />
          <br />
          {
            !this.props.caseCount || this.props.caseCount === '0' ?
            <div className="blank-state">
              <div className="blank-state--inner text-center text-gray">
                <span>You do not have any historical or pending cases.</span>
              </div>
            </div> :
            <div>
              <FlipMove enterAnimation="accordionVertical" className="case-list">
                {this.state.cases.map(({caseAddress, status, caseIndex}) => {
                  const statusLabel = caseStatusToName(status)
                  const statusClass = caseStatusToClass(status)
                  return (
                    <CaseRowContainer
                      route={routes.PATIENTS_CASE}
                      statusLabel={statusLabel}
                      statusClass={statusClass}
                      caseAddress={caseAddress}
                      caseIndex={caseIndex}
                      key={caseIndex} />
                  )
                })}
              </FlipMove>
            </div>
          }
        </div>
      </div>
    )
  }
})))

export const PatientCasesContainer = withRouter(PatientCases)
