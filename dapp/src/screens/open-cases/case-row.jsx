import React, {
  Component
} from 'react'
import { connect } from 'react-redux'
import dispatch from '@/dispatch'
import get from 'lodash.get'

const CaseRow = connect(
  (state, ownProps) => {
    let status = get(state, `cases[${ownProps.case.address}]`)
    let props = {}
    if (status) { props.status = status }
    return props
  }
)(class extends Component {
  componentDidMount() {
    dispatch({ type: 'CASE_FETCH_REQUESTED', address: this.props.case.address })
  }

  render () {
    if (this.props.case.requested) {
      'Pending'
    }
    return (
      <tr>
        <td>Test</td>
        <td>{this.props.status.name}</td>
        <td>Out</td>
      </tr>
    )
  }
})

CaseRow.defaultProps = {
  status: {
    code: 0,
    name: 'Unknown'
  }
}

export { CaseRow }
