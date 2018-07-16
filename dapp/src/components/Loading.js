import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group'
import medCreditsLoadingImg from '~/assets/img/medcredits-logo--animated.svg';

export const Loading = class _Loading extends Component {
  render() {
    return <CSSTransition
        in={this.props.loading}
        timeout={1000}
        unmountOnExit
        classNames="fade-slow"
      >
        <div className="loading--overlay">
          <div className="loading">
            <img width="100" height="100" src={medCreditsLoadingImg} alt="MedCredits Loading Indicator" />
            <p>
              Working on your request ...
              <br />
              <span className="small visible-sm visible-md visible-lg">(You may need to check MetaMask)</span>
            </p>
          </div>
        </div>
      </CSSTransition>
  }
}

Loading.propTypes = {
  loading: PropTypes.bool
};

Loading.defaultProps = {
  loading: true
};
