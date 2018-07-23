import React, { Component } from 'react'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { HippoTextInput } from '~/components/forms/HippoTextInput'

export const SpotQuestions = class _SpotQuestions extends Component {

  render() {
    const {
      errors,
      textInputOnBlur,
      textInputOnChange,
      buttonGroupOnChange
    } = this.props

    return (
      <span>
        <HippoToggleButtonGroup
          id='howLong'
          name="howLong"
          colClasses='col-xs-12 col-md-8'
          label='How long has it been there?'
          error={errors['howLong']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Days', 'Weeks', 'Months', 'Years']}
        />

        <HippoToggleButtonGroup
          id='hadBefore'
          name="hadBefore"
          colClasses='col-xs-12 col-md-8'
          label='Have you had a spot like this before?'
          error={errors['hadBefore']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Yes', 'No']}
        />

        <HippoToggleButtonGroup
          id='sexuallyActive'
          name="sexuallyActive"
          colClasses='col-xs-12 col-md-8'
          label='Are you sexually active?'
          error={errors['sexuallyActive']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Yes', 'No']}
        />



        <HippoToggleButtonGroup
          id='painful'
          name="painful"
          colClasses='col-xs-12 col-md-8'
          label='Is it painful?'
          error={errors['painful']}
          onChange={this.updatePainful}
          values={['Yes', 'No']}
        />

        <HippoToggleButtonGroup
          id='bleeding'
          name="bleeding"
          colClasses='col-xs-12 col-md-8'
          label='Is it bleeding?'
          error={errors['bleeding']}
          onChange={this.updateBleeding}
          values={['Yes', 'No']}
        />

        <HippoToggleButtonGroup
          id='itching'
          name="itching"
          colClasses='col-xs-12 col-md-8'
          label='Is it itching?'
          error={errors['itching']}
          onChange={this.updateItching}
          values={['Yes', 'No']}
        />

        <HippoToggleButtonGroup
          id='skinCancer'
          name="skinCancer"
          colClasses='col-xs-12 col-md-8'
          label='Any history of skin cancer?'
          error={errors['skinCancer']}
          onChange={this.updateSkinCancer}
          values={['Yes', 'No']}
        />



        <HippoTextInput
          id='color'
          name="color"
          colClasses='col-xs-12 col-sm-12 col-md-8'
          label='Has it changed in color?'
          error={errors['color']}
          onBlur={this.validateField}
          onChange={(event) => this.setState({ color: event.target.value })}
        />

        <HippoTextInput
          id='prevTreatment'
          name="prevTreatment"
          colClasses='col-xs-12 col-sm-12 col-md-8'
          label='Have you tried any treatments so far?'
          error={errors['prevTreatment']}
          onBlur={this.validateField}
          onChange={(event) => this.setState({ prevTreatment: event.target.value })}
        />
      </span>
    )
  }

}
