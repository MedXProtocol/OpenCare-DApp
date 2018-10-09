import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'
import PropTypes from 'prop-types'
import { CSSTransition } from 'react-transition-group'
import medCreditsLoadingImg from '~/assets/img/medcredits-logo--animated.svg'

const REFRESH_DELAY_MS = 30000

export const Loading = ReactTimeout(class _Loading extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showReload: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loading !== nextProps.loading) {
      if (nextProps.loading) {
        this.props.setTimeout(() => {
          this.setState({ showReload: true })
        }, REFRESH_DELAY_MS)
      } else if (!nextProps.loading) {
        this.setState({ showReload: false })
      }
    }
  }

  render() {
    let checkMetaMask, showReloadMsg

    if (this.state.showReload) {
      showReloadMsg = (
        <span className="small">
          <br />
          This is taking longer than expected.
          <br />If the app is not responding you can refresh and try again:
          <br />
          <br />
          <a
            className="btn btn-sm btn-clear"
            onClick={(e) => {
              e.preventDefault()
              if (window) {
                window.location.reload(true)
              }
            }}
          >Refresh</a>
        </span>
      )
    } else {
      checkMetaMask = <span className="small visible-sm visible-md visible-lg">(You may need to check MetaMask)</span>
    }

    return <CSSTransition
        in={this.props.loading}
        timeout={1000}
        unmountOnExit
        classNames="fade-slow"
      >
        <div className="loading--overlay">
          <div className="loading">
            <img width="100" height="100" src={medCreditsLoadingImg} alt="MedX Protocol Loading Indicator" />
            <p>
              Working on your request ...
              <br />
              {checkMetaMask}
              {showReloadMsg}
            </p>
          </div>
        </div>
      </CSSTransition>
  }
})

Loading.propTypes = {
  loading: PropTypes.bool
}

Loading.defaultProps = {
  loading: true
}
