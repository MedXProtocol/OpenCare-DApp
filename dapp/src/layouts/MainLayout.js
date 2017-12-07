import React, { Component } from 'react';
import Navbar from '../components/Navbar';

class MainLayout extends Component {
  render() {
    return (
        <div className="wrapper">
            <div className="main-panel">
                <Navbar />
                <div className="content">
                    {this.props.children}
                </div>
            </div>
        </div>
    );
  }
}
export default MainLayout;