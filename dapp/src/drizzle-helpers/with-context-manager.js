import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import get from 'lodash.get'

export function withContextManager(WrappedComponent, propFactory) {
  const mapStateToProps = (state, props) => {
    return {
      contracts: state.contracts,
      accounts: get(state, 'accounts', []),
      drizzleInitialized: get(state, 'drizzleStatus.initialized', false),
    }
  }

  const ContextManager = class extends Component {
    componentDidMount() {
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

  return drizzleConnect(ContextManager, mapStateToProps)
}
