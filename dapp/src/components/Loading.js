import React, { Component } from 'react';
import PropTypes from 'prop-types';
import medCreditsLoadingImg from '~/assets/img/medcredits-logo--animated.svg';

export const Loading = class extends Component {
  render() {
    return this.props.loading ?
      <div className="loading--overlay">
        <div className="loading">
          <img width="100" height="100" src={medCreditsLoadingImg} alt="MedCredits Loading Indicator" />
          <p>
            Working on your request ...
            <br />
            <span className="small">(You may need to check your MetaMask)</span>
          </p>
        </div>
      </div> : null;
  }
}

Loading.propTypes = {
  loading: PropTypes.bool
};

Loading.defaultProps = {
  loading: true
};
