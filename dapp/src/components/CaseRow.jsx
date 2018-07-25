import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight';
import { EthAddress } from '~/components/EthAddress'
import { LoadingLines } from '~/components/LoadingLines'

export const CaseRow = class _CaseRow extends Component {
  render () {
    let caseRoute, viewCase, ethAddress
    const { route, caseAddress, caseIndex, statusLabel, statusClass } = this.props
    const style = { zIndex: 998 - caseIndex }

    if (caseAddress) {
      caseRoute = formatRoute(route, { caseAddress: caseAddress })
      viewCase = (
        <span className="case-list--item__view text-right">
          <span className="case-list--item__view__text">View Case&nbsp;</span>
          <FontAwesomeIcon
            icon={faChevronCircleRight} />
        </span>
      )
      ethAddress = <EthAddress address={caseAddress} />
    } else {
      caseRoute = '/patients/cases'
      viewCase = (
        <span className="case-list--item__view text-right">
          <LoadingLines visible={true} color="#aaaaaa" />
        </span>
      )
    }

    return (
      <Link to={caseRoute} style={style} className="case-list--item list">
        <span className="case-list--item__case-number text-right">
          {caseIndex+1}
        </span>

        <span className="case-list--item__status text-center">
          <label className={`label label-${statusClass}`}>
            {statusLabel}
          </label>
        </span>

        <span className="case-list--item__eth-address text text-left">
          {ethAddress}
        </span>

        {viewCase}
      </Link>
    )
  }
}

CaseRow.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
