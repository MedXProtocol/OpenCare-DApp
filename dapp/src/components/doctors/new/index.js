import React, { Component } from 'react';
import { RegisterDoctorContainer } from './RegisterDoctor';
import { MainLayout } from '~/layouts/MainLayout';

export const AddDoctor = class extends Component {
  render() {
    return (
      <MainLayout>
        <RegisterDoctorContainer />
      </MainLayout>
    );
  }
}
