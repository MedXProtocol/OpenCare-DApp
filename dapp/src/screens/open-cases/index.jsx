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
import { drizzleConnect } from 'drizzle-react'
import { withPropSaga } from '@/saga-genesis/with-prop-saga'
import { sagaCacheContext } from '@/saga-genesis/saga-cache-context'
import { CaseRow } from './case-row'
import keys from 'lodash.keys'
import get from 'lodash.get'
import dispatch from '@/dispatch'
import { call } from 'redux-saga/effects'
import contractRegistry from '@/contract-registry'

function mapStateToProps(state, ownProps) {
  const account = get(state, 'accounts[0]')
  return {
    account
  }
}

function* propSaga(ownProps, { cacheCall, contractRegistry }) {
  const props = {}
  if (!ownProps.account) { return props }

  let caseManagerAddress = contractRegistry.addressByName('CaseManager')
  if (!caseManagerAddress) {
    caseManagerAddress = contractRegistry.add(yield call(getCaseManagerContract), 'CaseManager')
  }

  props.caseCount = yield call(cacheCall, caseManagerAddress, 'doctorAuthorizationRequestCount', ownProps.account)
  props.cases = []
  for (let i = 0; i < props.caseCount; i++) {
    props.cases.push(yield call(cacheCall, caseManagerAddress, 'doctorAuthorizationRequestCaseAtIndex', ownProps.account, i))
  }

  return props
}

const OpenCases = drizzleConnect(withPropSaga(sagaCacheContext({saga: propSaga, web3: getWeb3(), contractRegistry}), class extends Component {
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
}), mapStateToProps)

OpenCases.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCases.defaultProps = {
  cases: []
}

export { OpenCases }
