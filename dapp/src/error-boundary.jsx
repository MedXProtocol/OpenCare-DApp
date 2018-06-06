import React from 'react'
import bugsnag from 'bugsnag-js'
import createPlugin from 'bugsnag-react'

const bugsnagClient = bugsnag({
  apiKey: 'bad41fdef44b43ee85b2e58b3d432d6e',
  notifyReleaseStages: ['production', 'staging']
})
export const ErrorBoundary = bugsnagClient.use(createPlugin(React))
