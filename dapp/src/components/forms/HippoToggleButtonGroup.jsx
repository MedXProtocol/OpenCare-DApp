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
    const { id, name, error, label, setRef, onChange, values, colClasses } = this.props
    let required
    if (this.props.required)
      required = <span className='star'>*</span>

    return (
      <div className="row">
        <div className={colClasses}>
          <div id={id} className={classNames('form-group', { 'has-error': error })}>
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
                            onChange={onChange}
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
