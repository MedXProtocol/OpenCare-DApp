import React, { Component } from 'react'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { HippoTextInput } from '~/components/forms/HippoTextInput'
import { HippoCheckboxGroup } from '~/components/forms/HippoCheckboxGroup'

export const SpotQuestions = class _SpotQuestions extends Component {

  render() {
    const {
      errors,
      textInputOnBlur,
      textInputOnChange,
      buttonGroupOnChange,
      checkboxGroupOnChange
    } = this.props

    return (
      <span>
        <HippoToggleButtonGroup
          id='howLong'
          name="howLong"
          colClasses='col-xs-12 col-md-12'
          label='How long has it been there?'
          error={errors['howLong']}
          buttonGroupOnChange={buttonGroupOnChange}
          values={['Days', 'Weeks', 'Months', 'Years']}
        />

        <HippoToggleButtonGroup
          id='hadBefore'
          name="hadBefore"
          colClasses='col-xs-12 col-md-12'
          label='Ever had a spot like this before?'
          error={errors['hadBefore']}
          buttonGroupOnChange={buttonGroupOnChange}
          values={['Yes', 'No']}
        />

        <HippoCheckboxGroup
          id='isTheSpot'
          name="isTheSpot"
          colClasses='col-xs-8 col-md-8'
          label='Is the spot: (check all that apply)'
          error={errors['isTheSpot']}
          checkboxGroupOnChange={checkboxGroupOnChange}
          values={['Growing', 'Bleeding', 'Itching', 'Painful']}
        />

        <HippoToggleButtonGroup
          id='sexuallyActive'
          name="sexuallyActive"
          colClasses='col-xs-12 col-md-12'
          label='Sexually active?'
          error={errors['sexuallyActive']}
          buttonGroupOnChange={buttonGroupOnChange}
          values={['Yes', 'No']}
        />

        <HippoTextInput
          id='prevTreatment'
          name="prevTreatment"
          colClasses='col-xs-12 col-sm-12 col-md-12'
          label='Tried any treatments?'
          error={errors['prevTreatment']}
          textInputOnBlur={textInputOnBlur}
          textInputOnChange={textInputOnChange}
        />
      </span>
    )
  }

}
