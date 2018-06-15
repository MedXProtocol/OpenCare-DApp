import React from 'react'
import PropTypes from 'prop-types'

let mockMixpanel = {
  track: (...args) => {
    console.log('No window context or Mixpanel is not available but was called with: ', args)
  }
}

export const MixpanelProvider = class extends React.Component {
  static childContextTypes = {
    mixpanel: PropTypes.object
  }

  getChildContext() {
    return {
      mixpanel: (window && window.mixpanel) ? window.mixpanel : mockMixpanel
    }
  }

  render () {
    return React.Children.only(this.props.children)
  }
}
