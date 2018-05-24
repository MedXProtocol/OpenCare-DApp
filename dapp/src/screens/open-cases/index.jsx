import React, {
  Component
} from 'react'
import MainLayout from '@/layouts/MainLayout.js'
import {
  Button,
  Table
} from 'react-bootstrap'
import PropTypes from 'prop-types'
import getWeb3 from '@/get-web3'
import {
  getNextCaseFromQueue,
  getCaseManagerContract,
  getDoctorAuthorizationRequestCount,
  getDoctorAuthorizationRequestCaseAtIndex
} from '@/utils/web3-util'
import { connect } from 'react-redux'
import { withSaga, cacheCallValue, withContractRegistry } from '@/saga-genesis'
import { CaseRow } from './case-row'
import keys from 'lodash.keys'
import get from 'lodash.get'
import dispatch from '@/dispatch'
import { call } from 'redux-saga/effects'

function mapStateToProps(state, { contractRegistry }) {
  const account = get(state, 'accounts[0]')
  let caseManager = contractRegistry.requireAddressByName('CaseManager')
  let caseCount = cacheCallValue(state, caseManager, 'doctorAuthorizationRequestCount', account)
  let cases = []
  for (let i = 0; i < caseCount; i++) {
    let c = cacheCallValue(state, caseManager, 'doctorAuthorizationRequestCaseAtIndex', account, i)
    if (c) { cases.push(c) }
  }
  return {
    account,
    caseCount,
    cases
  }
}

function* saga({ account }, { cacheCall, contractRegistry }) {
  if (!account) { return }
  let caseManager = contractRegistry.requireAddressByName('CaseManager')
  let caseCount = yield cacheCall(caseManager, 'doctorAuthorizationRequestCount', account)
  for (let i = 0; i < caseCount; i++) {
    yield cacheCall(caseManager, 'doctorAuthorizationRequestCaseAtIndex', account, i)
  }
}

const OpenCases = withContractRegistry(connect(mapStateToProps)(withSaga(saga, { propTriggers: ['account'] })(class extends Component {
  onClickRequestCase = async (e) => {
    await getNextCaseFromQueue()
  }

  render () {
    let caseKeys = keys(this.props.cases)
    let cases = caseKeys.reverse().map((key) => this.props.cases[key])

    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className='col-xs-12'>
              <h2>Open Cases: {this.props.caseCount}</h2>
            </div>
            <div className="col-xs-12">
              <Button disabled={this.props.caseCount === '0'} onClick={this.onClickRequestCase} bsStyle="primary">Request Case</Button>
            </div>
            <div className="col-xs-12">
              <h2>Cases</h2>
              <Table>
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
      </MainLayout>
    )
  }
})))

OpenCases.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCases.defaultProps = {
  cases: []
}

export { OpenCases }
