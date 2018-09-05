import React, {
  Component
} from 'react'
import { Route, Redirect } from 'react-router-dom'
import get from 'lodash.get'
import { connect } from 'react-redux'
import * as routes from '~/config/routes'
import { setRequestedPathname } from '~/services/setRequestedPathname'

function mapStateToProps (state, ownProps) {
  const address = get(state, 'sagaGenesis.accounts[0]')
  const web3Initialized = get(state, 'sagaGenesis.web3.initialized')
  const localStorageEnabled = get(state, 'features.localStorage')
  return {
    address,
    web3Initialized,
    localStorageEnabled
  }
}

export const Web3Route = connect(mapStateToProps)(class _Web3Route extends Component {
  renderComponent (props) {
    const Component = this.props.component
    return <Component {...props} {...this.props} />
  }

  redirect () {
    if (!this.props.web3Initialized) {
      var redirect = routes.TRY_METAMASK
    } else if (!this.props.address) {
      redirect = routes.LOGIN_METAMASK
    } else if (!this.props.localStorageEnabled) {
      redirect = routes.SECURITY_SETTINGS
    }
    return redirect
  }

  render () {
    const redirect = this.redirect()
    if (redirect) {
      var component = <Redirect to={redirect} />
      setRequestedPathname(this.props.location.pathname)
    } else {
      const otherProps = {
        ...this.props,
        component: undefined
      }
      component = (
        <Route {...otherProps} render={props => this.renderComponent(props)} />
      )
    }
    return component
  }
})
