import React, { Component } from 'react'
import { RegisterDoctorContainer } from './RegisterDoctor'
import { MainLayoutContainer } from '~/layouts/MainLayout'
import { PageTitle } from '~/components/PageTitle'

export const AddDoctor = class extends Component {
  render() {
    return (
      <MainLayoutContainer>
        <PageTitle renderTitle={(t) => t('pageTitles.addDoctor')} />
        <RegisterDoctorContainer excludeAddresses={[]} />
      </MainLayoutContainer>
    )
  }
}
