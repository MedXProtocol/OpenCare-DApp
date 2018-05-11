import React, {
  Component
} from 'react'
import { connect } from 'react-redux'
import dispatch from '@/dispatch'
import get from 'lodash.get'

const CaseRow = connect(
  (state, ownProps) => {
    let status = get(state, `cases[${ownProps.address}]`)
    let props = {}
    if (status) { props.status = status }
    return props
  }
)(class extends Component {
  componentDidMount() {
    dispatch({ type: 'CASE_FETCH_REQUESTED', address: this.props.address })
  }

  render () {
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
