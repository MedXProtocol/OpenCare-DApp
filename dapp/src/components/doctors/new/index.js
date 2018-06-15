import React, { Component } from 'react';
import { RegisterDoctorContainer } from './RegisterDoctor';
import { MainLayoutContainer } from '~/layouts/MainLayout';

export const AddDoctor = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <RegisterDoctorContainer />
      </MainLayoutContainer>
    );
  }
}

