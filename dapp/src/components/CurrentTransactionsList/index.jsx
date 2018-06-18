import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavDropdown } from 'react-bootstrap'
import { I18n } from 'react-i18next'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import classnames from 'classnames'
import { transactionErrorToCode } from '~/services/transaction-error-to-code'

import './CurrentTransactionsList.scss'

function mapStateToProps(state) {
  return {
    transactions: state.sagaGenesis.transactions
  }
}

export const CurrentTransactionsList = connect(mapStateToProps)(
  class _CurrentTransactionsList extends Component {
    constructor(props) {
      super(props)

      this.state = {
        pendingOrErrorTransactions: []
      }
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.transactions) {
        let transactions = Object.entries(nextProps.transactions)
        let pendingOrErrorTransactions = transactions.filter(tx => {
          return (!tx[1].confirmed && !tx[1].error) ||
            (tx[1].error && transactionErrorToCode(tx[1].error) !== 'userRevert')
        })
        this.setState({
          pendingOrErrorTransactions
        })
      }
    }

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

    getDropdownClassName = (transactions) => {
      let error = this.state.pendingOrErrorTransactions.find(tx => tx[1].error)
      let notConfirmed = this.state.pendingOrErrorTransactions.find(tx => !tx[1].confirmed)

      let dropdownClass = this.getClassName(error, !notConfirmed)

      return dropdownClass
    }

    getTransactionHtml = (t) => {
      let transactions = []
      let transactionHtml = null

      if (this.state.pendingOrErrorTransactions.length === 0) {
        transactionHtml = (
          <div className="blank-state">
            <div className="blank-state--inner text-center text-gray">
              {t('transactions.blankState')}
            </div>
          </div>
        )
      } else {
        transactions = this.state.pendingOrErrorTransactions.reverse().map(tx => {
          const key   = tx[0]
          const { call, error, confirmed } = tx[1]
          let name = call.method
          let mintMedxCount = 1000 // these numbers could be pulled from the tx call args

          if (error) {
            var code = transactionErrorToCode(error)
            if (code) {
              var errorMessage =
                <div>
                  {t(`transactionErrors.${code}`)}
                </div>
            }
          }

          return (
            <CSSTransition
              key={`transaction-${key}`}
              timeout={100}
              classNames="fade">
              <li className="nav-transactions--item">
                <span className={classnames('nav-transactions--circle', this.getClassName(error, confirmed))} /> &nbsp;
                {t(`transactions.${name}`, {
                  mintMedxCount: mintMedxCount
                })}
                {errorMessage}
              </li>
            </CSSTransition>
          )
        })

        transactionHtml = (
          <ul className="nav-transactions--group">
            <TransitionGroup component={null}>
              {transactions}
            </TransitionGroup>
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
        </NavDropdown>
      )
    }
  }
)
