import React, { Component } from "react";
import Navbar from "../components/Navbar";

class MainLayout extends Component {
  render() {
    return (
      <div className="wrapper">
        <div className="main-panel">
          <Navbar />
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
