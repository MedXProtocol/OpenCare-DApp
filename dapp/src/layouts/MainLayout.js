import React, { Component } from "react";
import PropTypes from 'prop-types'
import Navbar from "~/components/Navbar";
import { NetworkCheckModal } from '~/components/NetworkCheckModal'

class MainLayout extends Component {
  static propTypes = {
    doNetworkCheck: PropTypes.bool
  }

  static defaultProps = {
    doNetworkCheck: true
  }

  render() {
    if (this.props.doNetworkCheck) {
      var networkCheckmodal = <NetworkCheckModal />
    }
    return (
      <div className="wrapper">
        <div className="main-panel">
          <Navbar />
          {networkCheckmodal}
          <div className="content">{this.props.children}</div>
        </div>
        <footer className="footer">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 text-center">
                <p className="text-footer">
                  &copy; 2018 MedCredits Inc. - All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default MainLayout;
