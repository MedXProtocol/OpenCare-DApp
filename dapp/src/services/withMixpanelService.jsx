import React, { Component } from 'react'

let mockMixpanel = {
  track: (...args) => {
    console.log('No window context or Mixpanel is not available but was called with: ', args)
  }
}

export const withMixpanel = function(WrappedComponent) {
  const MixpanelWrapper = class extends Component {

    constructor(props) {
      super(props)
      this.mixpanel = (window && window.mixpanel) ? window.mixpanel : mockMixpanel
    }


    render () {
      return <WrappedComponent {...this.props} mixpanel={this.mixpanel} />
    }
  }

  return MixpanelWrapper
}
