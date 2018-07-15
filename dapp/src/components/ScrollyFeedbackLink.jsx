import React, { Component } from 'react'
import raf from 'raf'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faTelegramPlane from '@fortawesome/fontawesome-free-brands/faTelegramPlane'

export const ScrollyFeedbackLink = class extends Component {
  fixedStyle = {
    position: 'fixed',
    transition: 'all .2s ease-in-out',
    bottom: 10,
    right: 10,
    zIndex: 1
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

    this.handlingScrollUpdate = false
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

  handleScroll = () => {
    if (!this.handlingScrollUpdate) {
      this.handlingScrollUpdate = true
      raf(this.update)
    }
  }

  update = () => {
    let currentScrollY = this.getScrollY()
    let newPreviousScrollY = this.state.previousScrollY
    let hidden = this.state.hidden

    if (currentScrollY >= this.state.previousScrollY) {
      hidden = true
    } else if (currentScrollY < (this.state.previousScrollY - this.props.scrollDiffAmount)) {
      hidden = false
    }

    this.setState({
      hidden: hidden,
      previousScrollY: currentScrollY
    })

    this.handlingScrollUpdate = false
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
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
          href="https://t.me/MedCredits"
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
