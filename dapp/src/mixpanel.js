import mixpanelBrowser from 'mixpanel-browser'

let mixpanel = {
  track: (...args) => {
    console.log('mixpanel.track() noop: ', args)
  },
  identify: (...args) => {
    console.log('mixpanel.identify() noop: ', args)
  },
  register: (...args) => {
    console.log('mixpanel.register() noop: ', args)
  }
}

if (process.env.REACT_APP_MIXPANEL_KEY) {
  mixpanel = mixpanelBrowser
  mixpanel.init(process.env.REACT_APP_MIXPANEL_KEY)
}

export { mixpanel }
