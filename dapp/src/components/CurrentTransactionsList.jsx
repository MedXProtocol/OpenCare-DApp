import React, { Component } from 'react'
import { connect } from 'react-redux'
import { NavDropdown } from 'react-bootstrap'

function mapStateToProps(state) {
  console.log(state.sagaGenesis.transactions)

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
      let labelClass = 'nav-transactions-text--warning'

      if (value.error)
        labelClass = 'nav-transactions-text--danger'
      else if (value.confirmed)
        labelClass = 'nav-transactions-text--success'

      return labelClass
    }

    render () {
      let transactions = Object.entries(this.props.transactions)
      let transactionHtml = null

      if (transactions.length === 0) {
        transactionHtml = (
          <div className="blank-state">
            <div className="blank-state--inner text-center text-gray">
              Currently there are no pending transactions
            </div>
          </div>
        )
      } else {
        transactions = transactions.reverse().map((tx) => {
          const key   = tx[0]
          const value = tx[1]
          let name = this.capitalizeAll(value.call.method)

          return (
            <li className="nav-transactions--item" key={`transaction-${key}`}>
              <span className={this.getClassName(value)}>{'\u2b24'}</span> {name}
            </li>
          )
        })

        transactionHtml = <ul className="nav-transactions--group">
          {transactions}
        </ul>
      }

      return (
        <NavDropdown title={`${transactions.length} \u2b24`} id='transactions'>
          <div className="nav-transactions">
            {transactionHtml}
          </div>
        </NavDropdown>
      )
    }
  }
)
