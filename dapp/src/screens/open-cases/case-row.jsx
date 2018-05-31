import React, {
  Component
} from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { getCaseDate, getCaseContract } from '@/utils/web3-util'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { withSaga, withContractRegistry, cacheCallValue } from '@/saga-genesis'
import { cacheCall } from '@/saga-genesis/sagas'
import { doctorCaseStatusToName } from '@/utils/doctor-case-status-to-name'
import getWeb3 from '@/get-web3'
import { addContract } from '@/saga-genesis/sagas'

function mapStateToProps(state, { address }) {
  let account = get(state, 'sagaGenesis.accounts[0]')
  const status = cacheCallValue(state, address, 'status')
  const caseFee = cacheCallValue(state, address, 'caseFee')
  const diagnosingDoctorA = cacheCallValue(state, address, 'diagnosingDoctorA')
  const diagnosingDoctorB = cacheCallValue(state, address, 'diagnosingDoctorB')
  return {
    status,
    caseFee,
    diagnosingDoctorA,
    diagnosingDoctorB,
    account
  }
}

function* propSaga({address}) {
  let props = {}
  yield addContract({address, contractKey: 'Case'})
  let status = parseInt(yield cacheCall(address, 'status'))
  yield cacheCall(address, 'caseFee')
  if (status >= 3) {
    yield cacheCall(address, 'diagnosingDoctorA')
  }
  if (status >= 7) {
    yield cacheCall(address, 'diagnosingDoctorB')
  }
}

const CaseRow = withContractRegistry(connect(mapStateToProps)(withSaga(propSaga, { propTriggers: ['address'] })(class _CaseRow extends Component {
  render () {
    var status = parseInt(this.props.status || 0)
    let isApprovedDiagnosingADoctor = this.props.diagnosingDoctorA == this.props.account && status > 3
    let isApprovedDiagnosingBDoctor = this.props.diagnosingDoctorB == this.props.account && status > 8
    if (isApprovedDiagnosingADoctor || isApprovedDiagnosingBDoctor) {
      var address = <Link to={`/diagnose-case/${this.props.address}`}>{this.props.address}</Link>
    } else {
      address = this.props.address
    }
    if (this.props.status) {
      var status = doctorCaseStatusToName(parseInt(this.props.status))
    }
    return (
      <tr>
        <td>{address}</td>
        <td>{status}</td>
        <td></td>
      </tr>
    )
  }
})))

CaseRow.defaultProps = {
  status: 0,
  date: null
}

export { CaseRow }
