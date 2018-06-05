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
      return string.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    }

    getClassName = (value) => {
      let labelClass = 'dock-text--warning'

      if (value.error)
        labelClass = 'dock-text--danger'
      else if (value.confirmed)
        labelClass = 'dock-text--success'

      return labelClass
    }

    render () {
      let transactions = null
      transactions = Object.entries(this.props.transactions).reverse().map((tx) => {
        const key   = tx[0]
        const value = tx[1]
        let name = this.capitalizeAll(value.call.method)

        return (
          <li className="dock--item" key={`transaction-${key}`}>
            <span className={this.getClassName(value)}>{'\u2b24'}</span> {name}
          </li>
        )
      })

      return (
        <NavDropdown title={`${transactions.length} Transaction(s)`} id='transactions'>
          <div className="dock">
            <ul className="dock--group">
              {transactions}
            </ul>
          </div>
        </NavDropdown>
      )
    }
  }
)
