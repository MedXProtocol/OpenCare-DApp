import React, { Component } from 'react';
import RegisterDoctor from './components/RegisterDoctor';

class AddDoctor extends Component {
  render() {
    return (
        <div>
            <h1>Add Doctor</h1>
            <RegisterDoctor />
        </div>
    );
  }
}

export default AddDoctor;
