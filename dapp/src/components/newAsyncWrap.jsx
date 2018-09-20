import React, {
  PureComponent
} from 'react'

export const newAsyncWrap = function ({ createImport, name }) {
  return class _AsyncWrap extends PureComponent {
    constructor (props) {
      super(props)
      this.state = {}
      this.mounted = false
    }

    componentDidMount () {
      this.runMount()
    }

    componentDidUpdate () {
      this.runMount()
    }

    runMount() {
      if (this.mounted) { return }
      createImport().then(_module => {
        this.setState({
          Component: _module[name]
        })
      })
      this.mounted = true
    }

    render () {
      var result = null
      if (this.state.Component) {
        result = React.createElement(this.state.Component, this.props)
      }
      return result
    }
  }
}
