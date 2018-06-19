import React, {
  Component
} from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import get from 'lodash.get'
import { formatRoute } from 'react-router-named-routes'
import * as routes from '~/config/routes'
import { withSaga, withContractRegistry, cacheCallValue } from '~/saga-genesis'
import { cacheCall } from '~/saga-genesis/sagas'
import { doctorCaseStatusToName, doctorCaseStatusToClass } from '~/utils/doctor-case-status-labels'
import { addContract } from '~/saga-genesis/sagas'

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
  yield addContract({address, contractKey: 'Case'})
  let status = parseInt(yield cacheCall(address, 'status'), 10)
  yield cacheCall(address, 'caseFee')
  if (status >= 3) {
    yield cacheCall(address, 'diagnosingDoctorA')
  }
  if (status >= 7) {
    yield cacheCall(address, 'diagnosingDoctorB')
  }
}

export const CaseRow = withContractRegistry(connect(mapStateToProps)(withSaga(propSaga, { propTriggers: ['address'] })(class _CaseRow extends Component {
  render () {
    const caseRoute = formatRoute(routes.DOCTORS_CASES_DIAGNOSE_CASE, { caseAddress: this.props.address })
    var status = parseInt(this.props.status || 0, 10)
    let isApprovedDiagnosingADoctor = this.props.diagnosingDoctorA === this.props.account && status > 3
    let isApprovedDiagnosingBDoctor = this.props.diagnosingDoctorB === this.props.account && status > 8
    if (isApprovedDiagnosingADoctor || isApprovedDiagnosingBDoctor) {
      var address = <Link to={caseRoute}>{this.props.address}</Link>
    } else {
      address = this.props.address
    }
    if (this.props.status) {
      status = doctorCaseStatusToName(parseInt(this.props.status, 10))
      var statusClass = doctorCaseStatusToClass(parseInt(this.props.status, 10))
    }
    return (
      <tr>
        <td className="eth-address text"><span>{address}</span></td>
        <td width="20%" className="td--status">
          <label className={`label label-${statusClass}`}>{status}</label>
        </td>
        <td width="5%"></td>
      </tr>
    )
  }
})))

CaseRow.defaultProps = {
  status: 0,
  date: null
}
