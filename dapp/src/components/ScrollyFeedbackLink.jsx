import React, { Component } from 'react'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faTelegramPlane from '@fortawesome/fontawesome-free-brands/faTelegramPlane'
import throttle from 'lodash.throttle'

export const ScrollyFeedbackLink = class _ScrollyFeedbackLink extends Component {
  fixedStyle = {
    position: 'fixed',
    transition: 'all .2s ease-in-out',
    bottom: 10,
    right: 10,
    zIndex: 1030
  }

  hiddenStyle = {
    transform: 'translateY(200%)'
  }

  scrolledInStyle = {
    transform: 'translateY(0)'
  }

  constructor(props) {
    super(props)
    this.state = {
      previousScrollY: 0,
      hidden: true
    }
  }

  getScrollY = () => {
    if (window.pageYOffset !== undefined) {
      return window.pageYOffset
    } else if (window.scrollTop !== undefined) {
      return window.scrollTop
    } else {
      return (document.documentElement || document.body.parentNode || document.body).scrollTop
    }
  }

  update = throttle(() => {
    let currentScrollY = this.getScrollY()
    let hidden = this.state.hidden

    if (currentScrollY >= this.state.previousScrollY) {
      hidden = true
    } else if (currentScrollY < this.state.previousScrollY) {
      hidden = false
    }

    this.setState({
      hidden: hidden,
      previousScrollY: currentScrollY
    })
  }, 200, { leading: true, trailing: false })

  componentDidMount() {
    window.addEventListener('scroll', this.update)
    window.addEventListener('touchmove', this.update)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.update)
    window.removeEventListener('touchmove', this.update)
  }

  render() {
    let renderStyle = this.fixedStyle
    renderStyle = this.state.hidden ?
        {...renderStyle, ...this.hiddenStyle} :
        {...renderStyle, ...this.scrolledInStyle}

    return (
      <div className="scroll-in-nav" ref="scrollnav">
        <a
          target="_blank"
          href="https://t.me/MedXProtocol"
          className="floating-feedback-link text-center"
          rel="noopener noreferrer"
          style={renderStyle}
        >
          <FontAwesomeIcon
            icon={faTelegramPlane}
            size='sm' />
          <span>
            Give Feedback
          </span>
        </a>
      </div>
    )
  }
}
