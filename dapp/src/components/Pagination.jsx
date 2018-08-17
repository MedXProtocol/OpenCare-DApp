import React, {
  Component
} from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import range from 'lodash.range'

export class Pagination extends Component {
  static propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    formatPageRoute: PropTypes.func.isRequired
  }
  render () {
    return (
      <nav aria-label="Page navigation" className="text-center">
        <ul className="pagination">
          { range(1, this.props.totalPages + 1).map((number) => {
            const path = this.props.formatPageRoute(number)

            return (
              <li
                key={`page-number-${number}`}
                className={classnames(
                  'pagination--page-number',
                  { 'active': this.props.currentPage === number }
                )}
              >
                <Link to={path}>
                  {number}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }
}
