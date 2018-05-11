import React, {
  Component
} from 'react'
import MainLayout from '@/layouts/MainLayout.js'
import {
  Button,
  Table
} from 'react-bootstrap'
import PropTypes from 'prop-types'
import { getNextCaseFromQueue, openCaseCount } from '@/utils/web3-util'
import { connect } from 'react-redux'
import { CaseRow } from './case-row'
import values from 'lodash.values'
import get from 'lodash.get'

const OpenCases = connect(
  (state, ownProps) => {
    let cases = get(state, `doctorCases[${window.web3.eth.accounts[0]}].cases`) || {}
    return {
      cases: values(cases)
    }
  }
)(class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openCaseCount: 0
    }
    openCaseCount().then((response) => {
      this.setState({openCaseCount: response.toString()})
    })
  }

  onClickRequestCase = async (e) => {
    await getNextCaseFromQueue()
  }

  render () {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className='col-xs-12'>
              <h2>Open Cases: {this.state.openCaseCount}</h2>
            </div>
            <div className="col-xs-12">
              <Button disabled={this.state.openCaseCount === '0'} onClick={this.onClickRequestCase} bsStyle="primary">Request Case</Button>
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
                    this.props.cases.map(caze => <CaseRow case={caze} key={caze.address} />)
                  }
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }
})

OpenCases.propTypes = {
  cases: PropTypes.array.isRequired
}

OpenCases.defaultProps = {
  cases: []
}

export { OpenCases }
