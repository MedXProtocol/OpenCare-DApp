import React from 'react'
import bugsnag from 'bugsnag-js'
import createPlugin from 'bugsnag-react'

const bugsnagClient = bugsnag('3bef204414a2e3eca7010a1f93325376')
export const ErrorBoundary = bugsnagClient.use(createPlugin(React))
