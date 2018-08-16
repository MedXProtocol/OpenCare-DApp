import bugsnag from 'bugsnag-js'

let client = null

if (process.env.REACT_APP_BUGSNAG_API_KEY && process.env.REACT_APP_ENV) {
  client = bugsnag({
    apiKey: process.env.REACT_APP_BUGSNAG_API_KEY,
    notifyReleaseStages: ['production', 'staging'],
    releaseStage: process.env.REACT_APP_ENV
  })
} else {
  client = {
    notify: (...args) => {
      console.error('bugsnagClient mock notify(): ', args)
    },
    use: (...args) => {
      console.error('bugsnagClient mock use(): ', args)
    }
  }
}

export const bugsnagClient = client
