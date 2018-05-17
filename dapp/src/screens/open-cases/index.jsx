import React, {
  Component
} from 'react'
import MainLayout from '@/layouts/MainLayout.js'
import {
  Button,
  Table
} from 'react-bootstrap'
import PropTypes from 'prop-types'
import {
  getNextCaseFromQueue
} from '@/utils/web3-util'
import { drizzleConnect } from 'drizzle-react'
import { CaseRow } from './case-row'
import keys from 'lodash.keys'
import get from 'lodash.get'
import dispatch from '@/dispatch'

function mapStateToProps(state, ownProps) {
  let cases = get(state, `doctorCases.cases`) || {}
  let caseCount = get(state, `caseCount.count`, '0').toString()
  return {
    cases,
    caseCount: caseCount
  }
}

const OpenCases = drizzleConnect(class extends Component {
  componentDidMount() {
    dispatch({type: 'OPEN_CASE_COUNT_FETCH_REQUESTED'})
    dispatch({type: 'DOCTOR_CASES_FETCH_REQUESTED'})
  }

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
}, mapStateToProps)

OpenCases.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCases.defaultProps = {
  cases: []
}

export { OpenCases }
