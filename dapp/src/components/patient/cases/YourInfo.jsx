import React, { Component } from 'react'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { HippoTextInput } from '~/components/forms/HippoTextInput'

export const YourInfo = class _YourInfo extends Component {

  render() {
    return (
      <span>
        <div className="row">
          <div className="col-xs-4 col-sm-3 col-md-2">
            <HippoTextInput
              type='number'
              id='age'
              name='age'
              label='Age'
              error={this.props.errors['age']}
              textInputOnBlur={this.props.textInputOnBlur}
              textInputOnChange={this.props.textInputOnChange}
            />
          </div>
        </div>

        <HippoToggleButtonGroup
          id='gender'
          name="gender"
          colClasses='col-xs-12 col-md-8'
          label='Gender'
          error={this.props.errors['gender']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Male', 'Female']}
        />

        <HippoToggleButtonGroup
          id='pregnant'
          name="pregnant"
          colClasses='col-xs-12 col-md-8'
          label='Pregnant?'
          error={this.props.errors['pregnant']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Yes', 'No', 'Unsure']}
          visible={this.props.gender === 'Female' ? true : false}
        />

        <HippoToggleButtonGroup
          id='allergies'
          name="allergies"
          colClasses='col-xs-12 col-md-8'
          label='Allergies?'
          error={this.props.errors['allergies']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Yes', 'No']}
        />

        <HippoTextInput
          id='whatAllergies'
          name="whatAllergies"
          colClasses='col-xs-12 col-sm-12 col-md-8'
          label='What are your allergies?'
          error={this.props.errors['whatAllergies']}
          textInputOnBlur={this.props.textInputOnBlur}
          textInputOnChange={this.props.textInputOnChange}
          visible={this.props.allergies === 'Yes' ? true : false}
        />

        <div className="form-group--heading">
          Your Condition:
        </div>

        <HippoToggleButtonGroup
          id='spotRashOrAcne'
          name="spotRashOrAcne"
          colClasses='col-xs-12 col-md-8'
          label='Do you have a concerning spot, rash or acne?'
          error={this.props.errors['spotRashOrAcne']}
          buttonGroupOnChange={this.props.buttonGroupOnChange}
          values={['Spot', 'Rash', 'Acne']}
        />
      </span>
    )
  }

}
