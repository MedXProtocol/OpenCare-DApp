import React from 'react'
import createPlugin from 'bugsnag-react'
import { bugsnagClient } from '~/bugsnagClient'

let boundary

if (process.env.REACT_APP_BUGSNAG_API_KEY && process.env.REACT_APP_ENV) {
  boundary = bugsnagClient.use(createPlugin(React))
} else {
  boundary = class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
      bugsnagClient.notify(error, errorInfo)
    }

    render() {
      return this.props.children;
    }
  }
}

export const ErrorBoundary = boundary
