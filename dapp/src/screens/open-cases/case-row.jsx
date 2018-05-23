import React, {
  Component
} from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import dispatch from '@/dispatch'
import get from 'lodash.get'
import { getCaseDate, getCaseContract } from '@/utils/web3-util'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { withSaga, cacheCallValue } from '@/saga-genesis'
import { caseStatusToName } from '@/utils/case-status-to-name'
import getWeb3 from '@/get-web3'

function mapStateToProps(state, { address, contractRegistry }) {
  let account = get(state, 'accounts[0]')
  return {
    status: cacheCallValue(state, address, 'status'),
    caseFee: cacheCallValue(state, address, 'caseFee'),
    diagnosingDoctorA: cacheCallValue(state, address, 'diagnosingDoctorA'),
    diagnosingDoctorB: cacheCallValue(state, address, 'diagnosingDoctorB'),
    account
  }
}

function* propSaga({address}, {cacheCall, contractRegistry}) {
  let props = {}
  if (!contractRegistry.hasAddress(address)) {
    contractRegistry.add(yield getCaseContract(address))
  }
  let status = parseInt(yield cacheCall(address, 'status'))
  yield cacheCall(address, 'caseFee')
  if (status >= 3) {
    yield cacheCall(address, 'diagnosingDoctorA')
  }
  if (status >= 7) {
    yield cacheCall(address, 'diagnosingDoctorB')
  }
}

const CaseRow = connect(mapStateToProps)(withSaga(propSaga, class extends Component {
  render () {
    if (this.props.diagnosingDoctorA === this.props.account || this.props.diagnosingDoctorB === this.props.account) {
      var address = <Link to={`/diagnose-case/${this.props.address}`}>{this.props.address}</Link>
    } else {
      address = this.props.address
    }
    if (this.props.status) {
      var status = caseStatusToName(parseInt(this.props.status))
    }
    return (
      <tr>
        <td>{address}</td>
        <td>{status} {this.props.statusInFlight}</td>
        <td></td>
      </tr>
    )
  }
}))

CaseRow.defaultProps = {
  status: 0,
  date: null
}

export { CaseRow }
