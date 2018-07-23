import React, { Component } from 'react'
import classNames from 'classnames'
import { defined } from '~/utils/defined'
import { ControlLabel, ToggleButtonGroup, ToggleButton, ButtonToolbar } from 'react-bootstrap'

export const HippoToggleButtonGroup = class _HippoToggleButtonGroup extends Component {

  constructor(props) {
    super(props)

    this.state = {
      visible: true
    }
  }

  componentWillReceiveProps(nextProps) {
    if (defined(nextProps.visible) && nextProps.visible !== this.state.visible) {
      this.setState({ visible: nextProps.visible })
    }
  }

  handleChange = (event) => {
    event.persist()
    this.props.buttonGroupOnChange(event)
  }

  render() {
    const { id, name, error, label, values, colClasses } = this.props

    if (!this.state.visible) {
      return null
    }

    return (
      <div className="row">
      {this.state.visible}
        <div className={colClasses}>
          <div id={id} className={classNames('form-group', { 'has-error': error })}>
            <ControlLabel>{label}</ControlLabel>
            <ButtonToolbar>
              <ToggleButtonGroup name={name} type="radio">
                {
                  values.map((value) => {
                    return <ToggleButton
                            key={`${name}-${value}`}
                            onChange={this.handleChange}
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
