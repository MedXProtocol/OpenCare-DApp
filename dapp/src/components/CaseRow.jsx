import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight';
import { EthAddress } from '~/components/EthAddress'
import { LoadingLines } from '~/components/LoadingLines'
import { transactionErrorToCode } from '~/services/transaction-error-to-code'
import i18next from 'i18next'

function mapDispatchToProps (dispatch) {
  return {
    send: (transactionId, call, options) => {
      dispatch({ type: 'SEND_TRANSACTION', transactionId, call, options })
    }
  }
}

export const CaseRow = connect(null, mapDispatchToProps)(class _CaseRow extends Component {
  render () {
    let caseRoute, viewCase, ethAddress, label, labelClass, itemClass
    let options = {}
    const { caseRowObject, route } = this.props
    const {
      caseAddress,
      objIndex,
      receipt,
      error,
      call,
      gasUsed,
      statusLabel,
      statusClass,
      transactionId
    } = caseRowObject
    const style = { zIndex: 998 - objIndex }

    if (caseAddress) {
      caseRoute = formatRoute(route, { caseAddress })
      viewCase = (
        <React.Fragment>
          <span className="case-list--item__view__text">View Case&nbsp;</span>
          <FontAwesomeIcon
            icon={faChevronCircleRight} />
        </React.Fragment>
      )
      ethAddress = <EthAddress address={caseAddress} />
      label = statusLabel
      labelClass = statusClass
      itemClass = ''
    } else {
      caseRoute = '/patients/cases'
      viewCase = (
        <React.Fragment>
          <LoadingLines visible={true} color="#aaaaaa" />
        </React.Fragment>
      )
      if (error) {
        const code = transactionErrorToCode(error.message)
        label = 'There was a transaction error'
        if (code) {
          label = i18next.t(`transactionErrors.${code}`)
        }
        labelClass = 'danger'

        if (gasUsed)
          options['gas'] = parseInt(1.2 * gasUsed, 10)

        viewCase = <button
          className="btn btn-danger btn-xs"
          onClick={(e) => {
            e.preventDefault()
            this.props.send(transactionId, call, options)
          }}
        >Retry</button>
      } else if (receipt) {
        label = 'Confirming'
        labelClass = 'warning'
      } else {
        label = 'Pending'
        labelClass = 'default'
      }
      itemClass = ' case-list--item__pending'
    }

    return (
      <Link to={caseRoute} style={style} className={'case-list--item list' + itemClass}>
        <span className="case-list--item__case-number text-center">
          {objIndex+1}
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
})

CaseRow.propTypes = {
  route: PropTypes.string,
  caseRowObject: PropTypes.object
}
