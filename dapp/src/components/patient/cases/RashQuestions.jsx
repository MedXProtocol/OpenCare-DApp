import React, { Component } from 'react'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { HippoTextInput } from '~/components/forms/HippoTextInput'
import { HippoCheckboxGroup } from '~/components/forms/HippoCheckboxGroup'

export const RashQuestions = class _RashQuestions extends Component {

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
          label='Have you had a rash like this before?'
          error={errors['hadBefore']}
          buttonGroupOnChange={buttonGroupOnChange}
          values={['Yes', 'No']}
        />

        <HippoCheckboxGroup
          id='isTheRash'
          name="isTheRash"
          colClasses='col-xs-8 col-md-8'
          label='Is the rash: (check all that apply)'
          error={errors['isTheRash']}
          checkboxGroupOnChange={checkboxGroupOnChange}
          values={['Spreading', 'Bleeding', 'Itching', 'Painful', 'Constant', 'Comes and goes']}
        />

        <HippoToggleButtonGroup
          id='sexuallyActive'
          name="sexuallyActive"
          colClasses='col-xs-12 col-md-12'
          label='Are you sexually active?'
          error={errors['sexuallyActive']}
          buttonGroupOnChange={buttonGroupOnChange}
          values={['Yes', 'No']}
        />

        <HippoTextInput
          id='prevTreatment'
          name="prevTreatment"
          colClasses='col-xs-12 col-sm-12 col-md-12'
          label='Have you tried any treatments?'
          error={errors['prevTreatment']}
          textInputOnBlur={textInputOnBlur}
          textInputOnChange={textInputOnChange}
        />
      </span>
    )
  }

}
