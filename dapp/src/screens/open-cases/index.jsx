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
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-solid/faEdit';
import faNotesMedical from '@fortawesome/fontawesome-free-solid/faNotesMedical';
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
          <div className='header-card card'>
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-8 col-sm-12'>
                  <h3 className="title">
                    Diagnose Cases
                  </h3>
                  <span className="sm-block text-gray">
                    <strong>Open Cases:</strong> {this.props.openCaseCount} &nbsp;
                  </span>
                </div>
                <div className='col-md-4 col-sm-12 button-container'>
                  <Button
                    disabled={this.props.openCaseCount === '0'}
                    onClick={this.onClickRequestCase}
                    bsStyle="info">
                    <FontAwesomeIcon
                      icon={faNotesMedical}
                      size='lg' /> &nbsp; Request Case
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className='col-xs-12'>
              <div className="card">
                <div className='card-body'>
                  <Table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Status</th>
                        <th className="text-right">
                          <FontAwesomeIcon icon={faEdit} />
                        </th>
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

// <div className='card-header'>
//   <h4 className="card-title">
//     All Cases
//   </h4>
// </div>
