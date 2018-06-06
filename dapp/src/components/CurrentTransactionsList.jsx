import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavDropdown } from 'react-bootstrap'
import { I18n } from 'react-i18next'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

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
        let pendingOrErrorTransactions = transactions.filter(tx => (tx[1].error || !tx[1].confirmed))

        this.setState({
          pendingOrErrorTransactions: pendingOrErrorTransactions
        })
      }
    }

    getClassName = (value) => {
      let labelClass = ''

      if (value.error)
        labelClass = 'nav-transactions-text--danger'
      else if (value.confirmed)
        labelClass = 'nav-transactions-text--success'
      else
        labelClass = 'nav-transactions-text--warning'

      return labelClass
    }

    getDropdownClassName = (transactions) => {
      let dropdownClass = ''
      let hasError
      let hasPending

      hasError = this.state.pendingOrErrorTransactions.find(tx => tx[1].error)
      hasPending = this.state.pendingOrErrorTransactions.find(tx => !tx[1].confirmed)

      if (hasError)
        dropdownClass = 'nav-transactions-text--danger'
      else if (hasPending)
        dropdownClass = 'nav-transactions-text--warning'
      else
        dropdownClass = 'nav-transactions-text--success'

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
          const value = tx[1]
          let name = value.call.method
          let mintMedxCount = 1000 // these numbers could be pulled from the tx call args

          return (
            <CSSTransition
              key={`transaction-${key}`}
              timeout={500}
              classNames="fade">
              <li className="nav-transactions--item">
                <span className={this.getClassName(value)}>{'\u2b24'}</span> &nbsp;
                {t(`transactions.${name}`, {
                  mintMedxCount: mintMedxCount
                })}
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
              {this.state.pendingOrErrorTransactions.length} <span className={this.getDropdownClassName()}>{'\u2b24'}</span>
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
