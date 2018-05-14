import React, {
  Component
} from 'react'
import { drizzleConnect } from 'drizzle-react'
import dispatch from '@/dispatch'
import get from 'lodash.get'
import { getCaseDate } from '@/utils/web3-util'
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now'

function mapStateToProps(state, ownProps) {
  let status = get(state, `cases[${ownProps.address}]`)
  let date = get(state, `caseDates.cases[${ownProps.address}]`)
  let props = {}
  if (status) { props.status = status }
  if (date) { props.date = date }
  return props
}

const CaseRow = drizzleConnect(class extends Component {
  componentDidMount() {
    dispatch({ type: 'CASE_FETCH_REQUESTED', address: this.props.address })
    dispatch({ type: 'CASE_DATE_FETCH_REQUESTED', address: this.props.address })
  }

  render () {
    var date = '-'
    if (this.props.date) {
      var date = distanceInWordsToNow(new Date(this.props.date * 1000), {addSuffix: true})
    }
    return (
      <tr>
        <td>{date}</td>
        <td>{this.props.status.name}</td>
        <td></td>
      </tr>
    )
  }
}, mapStateToProps)

CaseRow.defaultProps = {
  status: {
    code: 0,
    name: 'Unknown'
  },
  date: null
}

export { CaseRow }
