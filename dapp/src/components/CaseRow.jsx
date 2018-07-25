import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatRoute } from 'react-router-named-routes'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronCircleRight from '@fortawesome/fontawesome-free-solid/faChevronCircleRight';
import { EthAddress } from '~/components/EthAddress'
import { LoadingLines } from '~/components/LoadingLines'
import { txErrorMessage } from '~/services/txErrorMessage'

function mapDispatchToProps (dispatch) {
  return {
    dispatchSend: (transactionId, call, options) => {
      dispatch({ type: 'SEND_TRANSACTION', transactionId, call, options })
    },
    dispatchRemove: (transactionId) => {
      dispatch({ type: 'REMOVE_TRANSACTION', transactionId })
    }
  }
}

export const CaseRow = connect(null, mapDispatchToProps)(class _CaseRow extends Component {
  render () {
    let caseRoute, action, ethAddress, label, labelClass, itemClass, objNumber, remove
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
      objNumber = (objIndex + 1)
      caseRoute = formatRoute(route, { caseAddress })
      action = (
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
      objNumber = '...'
      caseRoute = '/patients/cases'
      action = (
        <React.Fragment>
          <LoadingLines visible={true} color="#aaaaaa" />
        </React.Fragment>
      )
      if (error) {
        label = txErrorMessage(error)
        labelClass = 'danger'

        if (gasUsed)
          options['gas'] = parseInt(1.2 * gasUsed, 10)

        action = <button
          className="btn btn-danger btn-xs"
          onClick={(e) => {
            e.preventDefault()
            this.props.dispatchSend(transactionId, call, options)
          }}
        >Retry</button>
        remove = <button
          className="btn-link text-gray"
          onClick={(e) => {
            e.preventDefault()
            this.props.dispatchRemove(transactionId)
          }}
        >&times;</button>
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
          {objNumber}
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
          {action} {remove}
        </span>
      </Link>
    )
  }
})

CaseRow.propTypes = {
  route: PropTypes.string,
  caseRowObject: PropTypes.object
}
