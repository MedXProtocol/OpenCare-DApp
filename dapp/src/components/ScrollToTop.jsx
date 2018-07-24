import { Component } from 'react'

export class ScrollToTop extends Component {
  componentDidMount() {
    window.scrollTo(0, 0)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.scrollToTop) {
      window.scrollTo(0, 0)
    }
  }

  render() {
    return null
  }
}
