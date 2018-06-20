import React, { Component } from 'react';
import PropTypes from 'prop-types';
import medCreditsLoadingImg from '~/assets/img/medcredits-logo--animated.svg';

export const Spinner = class extends Component {
  render() {
    return this.props.loading ?
      <div className="loading--overlay">
        <div className="loading">
          <img width="60" height="60" src={medCreditsLoadingImg} alt="MedCredits Loading Indicator" />
          <p>
            Working on your request ...
            <br />
            <span className="text-gray small">(You may need to check your MetaMask)</span>
          </p>
        </div>
      </div> : null;
  }
}

Spinner.propTypes = {
  loading: PropTypes.bool
};

Spinner.defaultProps = {
  loading: true
};
