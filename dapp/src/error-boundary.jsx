import React from 'react'
import bugsnag from 'bugsnag-js'
import createPlugin from 'bugsnag-react'

let boundary

if (process.env.REACT_APP_BUGSNAG_API_KEY && process.env.REACT_APP_ENV) {
  const bugsnagClient = bugsnag({
    apiKey: process.env.REACT_APP_BUGSNAG_API_KEY,
    notifyReleaseStages: ['production', 'staging'],
    releaseStage: process.env.REACT_APP_ENV
  })
  boundary = bugsnagClient.use(createPlugin(React))
} else {
  boundary = class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
      console.error(error, errorInfo)
    }

    render() {
      return this.props.children;
    }
  }
}

export const ErrorBoundary = boundary
