import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight';
import { EthAddress } from '~/components/EthAddress'

export const CaseRow = class _CaseRow extends Component {
  render () {
    const caseRoute = formatRoute(this.props.route, { caseAddress: this.props.caseAddress })
    const style = { zIndex: 998 - this.props.caseIndex }

    return (
      <Link to={caseRoute} style={style} className="case-list--item list">
        <span className="case-list--item__case-number text-right">
          {this.props.caseIndex+1}
        </span>

        <span className="case-list--item__status text-center">
          <label className={`label label-${this.props.statusClass}`}>
            {this.props.statusLabel}
          </label>
        </span>

        <span className="case-list--item__eth-address text text-left">
          <EthAddress address={this.props.caseAddress} />
        </span>

        <span className="case-list--item__view text-right">
          <span className="case-list--item__view__text">View Case&nbsp;</span>
          <FontAwesomeIcon
            icon={faChevronCircleRight} />
        </span>
      </Link>
    )
  }
}

CaseRow.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
