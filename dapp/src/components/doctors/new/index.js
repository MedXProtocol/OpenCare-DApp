import React, { Component } from 'react'
import { RegisterDoctorContainer } from './RegisterDoctor'
import { PageTitle } from '~/components/PageTitle'

export const AddDoctor = class _AddDoctor extends Component {
  render() {
    return (
      <div>
        <PageTitle renderTitle={(t) => t('pageTitles.addDoctor')} />
        <RegisterDoctorContainer excludeAddresses={[]} />
      </div>
    )
  }
}
