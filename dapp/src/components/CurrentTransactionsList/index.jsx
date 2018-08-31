import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavDropdown } from 'react-bootstrap'
import { I18n } from 'react-i18next'
import FlipMove from 'react-flip-move'
import classnames from 'classnames'
import { txErrorMessage } from '~/services/txErrorMessage'
import { transactionErrorToCode } from '~/services/transactionErrorToCode'

import './CurrentTransactionsList.scss'

function mapStateToProps(state) {
  let transactions = Object.entries(state.sagaGenesis.transactions)
  let pendingOrErrorTransactions = transactions.filter(transaction => {
    const { confirmed, error } = transaction[1]
    return (!confirmed && !error) ||
      (error && transactionErrorToCode(error) !== 'userRevert')
  })

  return {
    pendingOrErrorTransactions
  }
}

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

export const CurrentTransactionsList = connect(mapStateToProps, mapDispatchToProps)(
  class _CurrentTransactionsList extends Component {
    getClassName = (error, confirmed) => {
      let labelClass = ''

      if (error)
        labelClass = 'nav-transactions-text--danger'
      else if (confirmed)
        labelClass = 'nav-transactions-text--success'
      else
        labelClass = 'nav-transactions-text--warning'

      return labelClass
    }

    getDropdownClassName = () => {
      let error = this.props.pendingOrErrorTransactions.find(tx => tx[1].error)
      let notConfirmed = this.props.pendingOrErrorTransactions.find(tx => !tx[1].confirmed)

      let dropdownClass = this.getClassName(error, !notConfirmed)

      return dropdownClass
    }

    getTransactionHtml = (t) => {
      let transactions = []
      let transactionHtml = null

      if (this.props.pendingOrErrorTransactions.length === 0) {
        transactionHtml = (
          <div className="blank-state">
            <div className="blank-state--inner text-center text-gray">
              {t('transactions.blankState')}
            </div>
          </div>
        )
      } else {
        transactions = this.props.pendingOrErrorTransactions.reverse().map(tx => {
          const key   = tx[0]
          const { call, error, confirmed, gasUsed, address } = tx[1]
          let name
          let mintMedxCount = 500 // these numbers could be pulled from the tx's call args

          if (error) {
            const options = {}
            if (gasUsed)
              options['gas'] = parseInt(1.2 * gasUsed, 10)

            var errorMessage = txErrorMessage(error)
            errorMessage = (
              <p className="small">
                {errorMessage}
              </p>
            )

            if (call.args) {
              var resendButton = (
                <React.Fragment>
                  {errorMessage ? null : <br />}
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      this.props.dispatchSend(key, call, options, address)
                    }}
                  >
                    Retry
                  </a>
                </React.Fragment>
              )
              var removeButton = (
                <React.Fragment>
                  <button
                    className="btn-link text-gray"
                    onClick={(e) => {
                      e.preventDefault()
                      this.props.dispatchRemove(key)
                    }}
                  >
                    {'\u2716'}
                  </button>
                </React.Fragment>
              )
            }
          }

          return (
            <li
              key={`transaction-${key}`}
              className="nav-transactions--item"
            >
              <span className={classnames('nav-transactions--circle', this.getClassName(error, confirmed))} /> &nbsp;
              {t(`transactions.${name}`, {
                mintMedxCount: mintMedxCount
              })}
              {confirmed}
              {errorMessage}
              {resendButton}
              {removeButton}
            </li>
          )
        })

        transactionHtml = (
          <ul className="nav-transactions--group">
            <FlipMove>
              {transactions}
            </FlipMove>
          </ul>
        )
      }

      return transactionHtml
    }

    render () {
      return (
        <NavDropdown
          id='transactions'
          title={
            <span>
              <span className={classnames('nav-transactions--circle', this.getDropdownClassName())} /> Status
            </span>
          }>
          <li>
            <div className="nav-transactions">
              <I18n>
                {
                  (t) => {
                    return (
                      <span>
                        {this.getTransactionHtml(t)}
                      </span>
                    )
                  }
                }
              </I18n>
            </div>
          </li>
        </NavDropdown>
      )
    }
  }
)
