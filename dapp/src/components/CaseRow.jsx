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
import * as routes from '~/config/routes'

function mapDispatchToProps (dispatch) {
  return {
    dispatchSend: (transactionId, call, options, address) => {
      dispatch({ type: 'SEND_TRANSACTION', transactionId, call, options, address })
    },
    dispatchRemove: (transactionId) => {
      dispatch({ type: 'REMOVE_TRANSACTION', transactionId })
    }
  }
}

function parseNewTxObject(caseRowObject, route) {
  let options = {}
  let caseRoute,
    action,
    ethAddress,
    label,
    labelClass,
    itemClass,
    objNumber,
    remove
  const {
    caseAddress,
    objIndex,
    receipt,
    error,
    call,
    gasUsed,
    transactionId
  } = caseRowObject

  objNumber = objIndex ? `${objIndex + 1}` : '...'
  caseRoute = caseAddress ? formatRoute(route, { caseAddress }) : routes.PATIENTS_CASES
  action = (
    <React.Fragment>
      <LoadingLines visible={true} color="#aaaaaa" />
    </React.Fragment>
  )

  ethAddress = caseAddress ? <EthAddress address={caseAddress} /> : null

  if (error) {
    label = txErrorMessage(error)
    labelClass = 'danger'

    if (gasUsed)
      options['gas'] = parseInt(1.2 * gasUsed, 10)

    action = <button
      className="btn btn-danger btn-xs"
      onClick={(e) => {
        e.preventDefault()
        this.props.dispatchSend(transactionId, call, options, caseAddress)
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
  } else if (caseAddress) {
    label = 'Submitting Diagnosis'
    labelClass = 'default'
  } else {
    label = 'Pending'
    labelClass = 'default'
  }
  itemClass = ' case-list--item__pending'

  return {
    caseRoute,
    action,
    ethAddress,
    label,
    labelClass,
    itemClass,
    objNumber,
    remove
  }
}

function parseExistingCaseObject(caseRowObject, route) {
  let caseRoute,
    action,
    ethAddress,
    label,
    labelClass,
    itemClass,
    objNumber
  const {
    caseAddress,
    objIndex,
    statusLabel,
    statusClass
  } = caseRowObject

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

  return {
    objNumber, caseRoute, action, ethAddress, label, labelClass, itemClass
  }
}

export const CaseRow = connect(null, mapDispatchToProps)(class _CaseRow extends Component {
  render () {
    let { caseRowObject } = this.props
    const { route } = this.props

    if (caseRowObject.call) {
      caseRowObject = parseNewTxObject(caseRowObject, route)
    } else {
      caseRowObject = parseExistingCaseObject(caseRowObject, route)
    }

    const style = { zIndex: 998 - caseRowObject.objIndex }

    return (
      <Link to={caseRowObject.caseRoute} style={style} className={'case-list--item list' + caseRowObject.itemClass}>
        <span className="case-list--item__case-number text-center">
          {caseRowObject.objNumber}
        </span>

        <span className="case-list--item__status text-center">
          <label className={`label label-${caseRowObject.labelClass}`}>
            {caseRowObject.label}
          </label>
        </span>

        <span className="case-list--item__eth-address text text-left">
          {caseRowObject.ethAddress}
        </span>

        <span className="case-list--item__view text-center">
          {caseRowObject.action} {caseRowObject.remove}
        </span>
      </Link>
    )
  }
})

CaseRow.propTypes = {
  route: PropTypes.string,
  caseRowObject: PropTypes.object
}
