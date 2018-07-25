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
    let caseRoute, viewCase, ethAddress, label, labelClass
    const { route, caseAddress, caseIndex, receipt, error } = this.props
    const style = { zIndex: 998 - caseIndex }

    if (caseAddress) {
      caseRoute = formatRoute(route, { caseAddress: caseAddress })
      viewCase = (
        <React.Fragment>
          <span className="case-list--item__view__text">View Case&nbsp;</span>
          <FontAwesomeIcon
            icon={faChevronCircleRight} />
        </React.Fragment>
      )
      ethAddress = <EthAddress address={caseAddress} />
      label = this.props.statusLabel
      labelClass = this.props.statusClass
    } else {
      caseRoute = '/patients/cases'
      viewCase = (
        <React.Fragment>
          <LoadingLines visible={true} color="#aaaaaa" />
        </React.Fragment>
      )
      if (error) {
        viewCase = 'Retry'
        label = error
        labelClass = 'danger'
      } else if (receipt) {
        label = 'Confirming'
        labelClass = 'warning'
      } else {
        label = 'Pending'
        labelClass = 'default'
      }
    }

    return (
      <Link to={caseRoute} style={style} className="case-list--item list">
        <span className="case-list--item__case-number text-center">
          {caseIndex+1}
        </span>

        <span className="case-list--item__status text-center">
          <label className={`label label-${labelClass}`}>
            {label}
          </label>
        </span>

        <span className="case-list--item__eth-address text text-left">
          {ethAddress}
        </span>

        <span className="case-list--item__view text-center">
          {viewCase}
        </span>
      </Link>
    )
  }
}

CaseRow.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
