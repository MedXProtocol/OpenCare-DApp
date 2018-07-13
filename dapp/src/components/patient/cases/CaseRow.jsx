import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { caseStatusToName, caseStatusToClass } from '~/utils/case-status-labels'
import { formatRoute } from 'react-router-named-routes'
import { EthAddress } from '~/components/EthAddress'
import * as routes from '~/config/routes'

export const CaseRowContainer = class _CaseRow extends Component {
  render () {
    if (!this.props.status) { return <li></li> }

    const status = +(this.props.status || '0')
    const caseRoute = formatRoute(routes.PATIENTS_CASE, { caseAddress: this.props.caseAddress })
    const style = { zIndex: 998 - this.props.caseIndex }

    return (
      <Link to={caseRoute} style={style} className="case-list--item list">
        <span className="case-list--item__case-number text-right">
          {this.props.caseIndex+1}
        </span>

        <span className="case-list--item__status text-center">
          <label className={`label label-${caseStatusToClass(status)}`}>
            {caseStatusToName(status)}
          </label>
        </span>

        <span className="case-list--item__eth-address text text-left">
          <EthAddress address={this.props.caseAddress} />
        </span>

        <span className="case-list--item__view text-right">
          View Case
        </span>
      </Link>
    )
  }
}

CaseRowContainer.propTypes = {
  caseAddress: PropTypes.string,
  caseIndex: PropTypes.any
}
