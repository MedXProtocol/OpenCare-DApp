import React, { Component } from 'react'

export const BodyClass = class extends Component {
  static defaultProps = {
    isDark: false
  }

  componentDidMount() {
    document.body.classList.toggle('body-inverse', this.props.isDark)
  }

  componentWillReceiveProps(nextProps) {
    document.body.classList.toggle('body-inverse', nextProps.isDark)
  }

  componentWillUnmount() {
    document.body.classList.remove('body-inverse')
  }

  render() {
    return this.props.children
  }
}
