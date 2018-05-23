import React, {
  Component
} from 'react'
import { Link } from 'react-router-dom'
import { drizzleConnect } from 'drizzle-react'
import dispatch from '@/dispatch'
import get from 'lodash.get'
import { getCaseDate, getCaseContract } from '@/utils/web3-util'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { withPropSaga } from '@/saga-genesis/with-prop-saga'
import { sagaCacheContext } from '@/saga-genesis/saga-cache-context'
import { caseStatusToName } from '@/utils/case-status-to-name'
import getWeb3 from '@/get-web3'
import callState from '@/saga-genesis/call-state'
import contractRegistry from '@/contract-registry'

function mapStateToProps(state, ownProps) {
  return {
    statusInFlight: callState(state, ownProps.address, 'status').inFlight,
    caseFeeInFlight: callState(state, ownProps.address, 'caseFee').inFlight,
    account: get(state, 'accounts[0]')
  }
}

function* propSaga(ownProps, {cacheCall, contractRegistry}) {
  let props = {}
  if (!contractRegistry.hasAddress(ownProps.address)) {
    contractRegistry.add(yield getCaseContract(ownProps.address))
  }
  let status = yield cacheCall(ownProps.address, 'status')
  props.status = parseInt(status)
  props.caseFee = yield cacheCall(ownProps.address, 'caseFee')
  if (props.status >= 3) {
    props.diagnosingDoctorA = yield cacheCall(ownProps.address, 'diagnosingDoctorA')
  }
  if (props.status >= 7) {
    props.diagnosingDoctorB = yield cacheCall(ownProps.address, 'diagnosingDoctorB')
  }

  return props
}

const CaseRow = drizzleConnect(withPropSaga(sagaCacheContext({saga: propSaga, web3: getWeb3(), contractRegistry}), class extends Component {
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
}), mapStateToProps)

CaseRow.defaultProps = {
  status: 0,
  date: null
}

export { CaseRow }
