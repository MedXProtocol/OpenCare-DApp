import React, { Component } from 'react';

class EmptyLayout extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
export default EmptyLayout;