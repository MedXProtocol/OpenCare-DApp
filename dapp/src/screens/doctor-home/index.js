import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import GetCase from './components/GetCase';
import Challenges from './components/Challenges';

class PhysicianProfile extends Component {
  constructor(){
    super()

    this.state = {
        isDoctor: true
    };
  }

  handleCloseModal = (event) => {
    event.preventDefault();
    this.props.history.push('/');
  }

  render() {
    return (
      <MainLayout>
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12">
              <GetCase />
            </div>
            <div className="col-lg-6 col-md-12">
              <Challenges />
            </div>
          </div>
        </div>
        <Modal show={!this.state.isDoctor}>
            <Modal.Body>
                <div className="row">
                    <div className="col text-center">
                        <h4>Current account is not registered as doctor.</h4>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={this.handleCloseModal} type="button" className="btn btn-defult">OK</button>
            </Modal.Footer>
        </Modal>
      </MainLayout>
    );
  }
}

export default withRouter(PhysicianProfile);
