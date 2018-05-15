import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import get from 'lodash.get'

export function withContextManager(WrappedComponent, propFactory) {
  const mapStateToProps = (state, props) => {
    return {
      accounts: get(state, 'accounts', []),
      contracts: state.contracts,
      transactions: state.transactions,
      transactionStack: state.transactionStack,
      drizzleInitialized: get(state, 'drizzleStatus.initialized', false),
      web3Status: get(state, 'web3.status')
    }
  }

  const ContextManager = class extends Component {
    constructor (props) {
      super(props)
      if (propFactory) {
        this.extraProps = propFactory(this)
      }
    }
    render () {
      return <WrappedComponent {...this.props} {...this.extraProps} />
    }
  }

  ContextManager.contextTypes = {
    drizzle: PropTypes.object
  }

  ContextManager.defaultProps = {
    accounts: [],
    drizzleInitialized: false
  }

  return drizzleConnect(ContextManager, mapStateToProps)
}
