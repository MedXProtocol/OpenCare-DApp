import React, { Component } from 'react'
import { RegisterDoctorContainer } from './RegisterDoctor'
import { PageTitle } from '~/components/PageTitle'

export const AdminDoctors = class _AdminDoctors extends Component {
  render() {
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.addDoctor')} />
        <RegisterDoctorContainer excludeAddresses={[]} />
      </div>
    )
  }
}
