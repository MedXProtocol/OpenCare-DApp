import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavDropdown } from 'react-bootstrap'
import { I18n } from 'react-i18next'

function mapStateToProps(state) {
  return {
    transactions: state.sagaGenesis.transactions
  }
}

export const CurrentTransactionsList = connect(mapStateToProps)(
  class _CurrentTransactionsList extends Component {
    constructor (props) {
      super(props)
      this.state = {
      }
    }

    capitalizeAll(string) {
      string = string.replace( /([A-Z])/g, " $1" );
      return string.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
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
      let transactionsFromStore = Object.entries(this.props.transactions)
      let dropdownClass = ''
      let hasError
      let hasPending

      hasError = transactionsFromStore.find(tx => tx[1].error)
      hasPending = transactionsFromStore.find(tx => !tx[1].confirmed)

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
      let transactionsFromStore = Object.entries(this.props.transactions)
      let transactionHtml = null

      if (transactionsFromStore.length === 0) {
        transactionHtml = (
          <div className="blank-state">
            <div className="blank-state--inner text-center text-gray">
              {t('transactions.blankState')}
            </div>
          </div>
        )
      } else {
        transactions = transactionsFromStore.reverse().map(tx => {
          const key   = tx[0]
          const value = tx[1]
          let name = value.call.method
          let mintMedxCount = 1000

          return (
            <li className="nav-transactions--item" key={`transaction-${key}`}>
              <span className={this.getClassName(value)}>{'\u2b24'}</span> &nbsp;
              {t(`transactions.${name}`, {
                mintMedxCount: mintMedxCount
              })}
            </li>
          )
        })

        transactionHtml = <ul className="nav-transactions--group">
          {transactions}
        </ul>
      }

      return transactionHtml
    }

    render () {
      return (
        <NavDropdown
          id='transactions'
          title={
            <span>
              {Object.entries(this.props.transactions).length} <span className={this.getDropdownClassName()}>{'\u2b24'}</span>
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
