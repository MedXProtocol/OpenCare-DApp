import React, {
  Component
} from 'react'
import { Link } from 'react-router-dom'
import { drizzleConnect } from 'drizzle-react'
import dispatch from '@/dispatch'
import get from 'lodash.get'
import { getCaseDate, getCaseContract } from '@/utils/web3-util'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'
import { withPropSaga } from '@/components/with-prop-saga'

function mapStateToProps(state, ownProps) {
  return {
    account: get(state, 'accounts[0]')
  }
}

function* asyncProps(ownProps) {
  let props = {}
  let contract = yield getCaseContract(ownProps.address)
  props.status = yield contract.methods.status().call()
  props.caseFee = yield contract.methods.caseFee().call()
  if (props.status === '3') {
    props.diagnosingDoctorA = yield contract.methods.diagnosingDoctorA().call()
    props.doctorKey = yield contract.methods.approvedDoctorKeys(props.diagnosingDoctorA).call()
  }

  return props
}

const CaseRow = drizzleConnect(withPropSaga(asyncProps, class extends Component {
  render () {
    if (this.props.diagnosingDoctorA === this.props.account) {
      var address = <Link to={`/diagnose-case/${this.props.address}`}>{this.props.address}</Link>
    } else {
      address = this.props.address
    }
    return (
      <tr>
        <td>{address}</td>
        <td>{this.props.status}</td>
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
