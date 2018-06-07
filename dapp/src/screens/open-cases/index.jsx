import React, {
  Component
} from 'react'
import MainLayout from '~/layouts/MainLayout.js'
import {
  Button,
  Table
} from 'react-bootstrap'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withSaga, cacheCallValue, withContractRegistry, withSend } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { CaseRow } from './case-row'
import keys from 'lodash.keys'
import get from 'lodash.get'
import { contractByName } from '~/saga-genesis/state-finders'

function mapStateToProps(state) {
  const account = get(state, 'sagaGenesis.accounts[0]')
  let CaseManager = contractByName(state, 'CaseManager')
  const openCaseCount = cacheCallValue(state, CaseManager, 'openCaseCount')
  let caseCount = cacheCallValue(state, CaseManager, 'doctorAuthorizationRequestCount', account)
  let cases = []
  for (let i = 0; i < caseCount; i++) {
    let c = cacheCallValue(state, CaseManager, 'doctorAuthorizationRequestCaseAtIndex', account, i)
    if (c) { cases.push(c) }
  }
  return {
    account,
    openCaseCount,
    caseCount,
    cases,
    CaseManager
  }
}

function* saga({ account, CaseManager }) {
  if (!account || !CaseManager) { return }
  yield cacheCall(CaseManager, 'openCaseCount')
  let caseCount = yield cacheCall(CaseManager, 'doctorAuthorizationRequestCount', account)
  for (let i = 0; i < caseCount; i++) {
    yield cacheCall(CaseManager, 'doctorAuthorizationRequestCaseAtIndex', account, i)
  }
}

const OpenCases = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account', 'caseCount', 'CaseManager'] })(withSend(class _OpenCases extends Component {
  onClickRequestCase = (e) => {
    const { send, CaseManager, contractRegistry } = this.props
    send(CaseManager, 'requestNextCase')()
  }

  render () {
    let caseKeys = keys(this.props.cases)
    let cases = caseKeys.reverse().map((key) => this.props.cases[key])

    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className='col-xs-12'>
              <div className="card">
                <div className='card-header'>
                  <div className="pull-left">
                    <h4 className="card-title">
                      Open Cases: {this.props.openCaseCount}
                    </h4>
                  </div>

                  <div className="pull-right">
                    <Button
                      className=""
                      disabled={this.props.openCaseCount === '0'}
                      onClick={this.onClickRequestCase}
                      bsStyle="success">Request Case</Button>
                  </div>
                </div>
                <div className='card-body'>
                  <h2>
                    Cases
                  </h2>

                  <Table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        cases.map(address => <CaseRow address={address} key={address} />)
                      }
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
}))))

OpenCases.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCases.defaultProps = {
  cases: []
}

export { OpenCases }
