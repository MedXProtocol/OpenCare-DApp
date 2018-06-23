import React, { Component } from 'react'
import classNames from 'classnames'
import {
  ControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  ButtonToolbar
} from 'react-bootstrap'

export const HippoToggleButtonGroup = class extends Component {
  render() {
    const { name, error, label, setRef, onChange, values } = this.props
    let required
    if (this.props.required)
      required = <span className='star'>*</span>

    return (
      <div className="row">
        <div className="col-xs-12 col-md-6">
          <div className={classNames('form-group', { 'has-error': error })}>

            <ControlLabel>{label} {required}</ControlLabel>
            <div className="hidden-input-mask">
              <input ref={setRef} />
            </div>
            <ButtonToolbar>
              <ToggleButtonGroup name="howLong" type="radio">
                {
                  values.map((value) => {
                    return <ToggleButton
                            key={`${name}-${value}`}
                            onChange={this.updateHowLong}
                            value={value}>
                            {value}
                          </ToggleButton>
                  })
                }
              </ToggleButtonGroup>
            </ButtonToolbar>
            {error}
          </div>
        </div>
      </div>
    )
  }
}

// error={errors['howLong']}
// setRef={this.setHowLongRef}
// onChange={this.updateHowLong}
// values={['Days', 'Weeks', 'Months', 'Years']}
