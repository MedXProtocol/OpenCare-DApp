import React, {
  Component
} from 'react'
import { Route, Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { connect } from 'react-redux'
import { setRequestedPathname } from '~/services/setRequestedPathname'
import * as routes from '~/config/routes'
import PropTypes from 'prop-types'

function mapStateToProps (state, ownProps) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const web3Initialized = get(state, 'sagaGenesis.web3.initialized')
  return {
    address,
    web3Initialized
  }
}

export const Web3Route = connect(mapStateToProps)(class _Web3Route extends Component {
  static propTypes = {
    signedIn: PropTypes.bool,
    hasAccount: PropTypes.bool
  }

  render () {
    const Component = this.props.component
    const otherProps = {
      ...this.props,
      component: undefined
    }

    if (!this.props.web3Initialized) {
      var redirect = routes.TRY_METAMASK
    } else if (!this.props.address) {
      redirect = routes.LOGIN_METAMASK
    }

    if (redirect) {
      var component = <Redirect to={redirect} />
      setRequestedPathname(this.props.location.pathname)
    } else {
      component = (
        <Route {...otherProps} render={props => <Component {...props} />} />
      )
    }

    return component
  }
})
