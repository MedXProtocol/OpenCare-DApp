import React, {
  Component
} from 'react'
import * as Animated from 'react-select/lib/animated'
import PropTypes from 'prop-types'
import { customStyles } from '~/config/react-select-custom-styles'
import classnames from 'classnames'
import Select from 'react-select'
import { HippoTextArea } from '~/components/forms/HippoTextArea'
import { HippoToggleButtonGroup } from '~/components/forms/HippoToggleButtonGroup'
import { groupedRecommendationOptions } from './recommendationOptions'

export const PrescriptionMedication = class _PrescriptionMedication extends Component {
  static propTypes = {
    medication: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    title: PropTypes.string
  }

  static defaultProps = {
    title: 'Prescription Medication'
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  onChange (field, value) {
    const newProps = {...this.props.medication}
    newProps[field] = value
    this.props.onChange(newProps)
  }

  onChangePrescription = (value) => {
    this.onChange('prescription', value)
  }

  onChangeUse = (event) => {
    this.onChange('use', event.target.value)
  }

  onChangeFrequency = (event) => {
    this.onChange('frequency', event.target.value)
  }

  onChangeDuration = (event) => {
    this.onChange('duration', event.target.value)
  }

  onChangeNotes = (event) => {
    this.onChange('notes', event.target.value)
  }

  render () {
    const isDefined = !!this.props.medication.prescription

    return (
      <div
        key={`key-prescriptionMedication`}
        className="form-group form-group--logical-grouping"
      >
        <label>{this.props.title}</label>

        <div className={classnames('form-group')}>
          <Select
            placeholder={groupedRecommendationOptions.prescriptionMedications.label}
            styles={customStyles}
            components={Animated}
            closeMenuOnSelect={true}
            options={groupedRecommendationOptions.prescriptionMedications.options}
            isMulti={false}
            isClearable
            onChange={this.onChangePrescription}
            selected={this.props.medication.prescription}
            required
          />
        </div>

        <HippoToggleButtonGroup
          id='prescriptionUse'
          name='prescriptionUse'
          colClasses='col-xs-12'
          label=''
          formGroupClassNames=''
          buttonGroupOnChange={this.onChangeUse}
          selectedValues={this.props.use}
          values={['Apply', 'Wash', 'Take by mouth']}
          visible={isDefined}
        />

        <div className="row">
          <HippoTextArea
            id='prescriptionFrequency'
            name="prescriptionFrequency"
            rowClasses=''
            colClasses='col-xs-6'
            label='Frequency'
            error={this.props.errors.frequency}
            textAreaOnBlur={this.props.onBlur}
            textAreaOnChange={this.onChangeFrequency}
            value={this.props.medication.frequency}
            visible={isDefined}
          />

          <HippoTextArea
            id='prescriptionDuration'
            name="prescriptionDuration"
            rowClasses=''
            colClasses='col-xs-6'
            label='Duration'
            error={this.props.errors.duration}
            textAreaOnBlur={this.props.onBlur}
            textAreaOnChange={this.onChangeDuration}
            value={this.props.medication.duration}
            visible={isDefined}
          />
        </div>

        <HippoTextArea
          id='prescriptionNotes'
          name="prescriptionNotes"
          colClasses='col-xs-12'
          label='Notes'
          optional={true}
          textAreaOnBlur={this.props.onBlur}
          textAreaOnChange={this.onChangeNotes}
          value={this.props.medication.notes}
          visible={isDefined}
        />
      </div>
    )
  }
}
