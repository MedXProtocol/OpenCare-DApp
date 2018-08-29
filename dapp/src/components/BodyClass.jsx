import React from 'react'

export const BodyClass = class _BodyClass extends React.Component {
  static defaultProps = {
    isDark: false
  }

  componentDidMount() {
    document.getElementsByTagName('html')[0].classList.toggle('body-inverse', this.props.isDark)
    document.body.classList.toggle('body-inverse', this.props.isDark)
  }

  componentWillReceiveProps(nextProps) {
    document.getElementsByTagName('html')[0].classList.toggle('body-inverse', nextProps.isDark)
    document.body.classList.toggle('body-inverse', nextProps.isDark)
  }

  componentWillUnmount() {
    document.getElementsByTagName('html')[0].classList.remove('body-inverse')
    document.body.classList.remove('body-inverse')
  }

  render() {
    return this.props.children
  }
}
