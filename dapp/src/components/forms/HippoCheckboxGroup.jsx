import React, { Component } from 'react'
import classNames from 'classnames'
import { defined } from '~/utils/defined'
import { ControlLabel, Checkbox, FormGroup } from 'react-bootstrap'
import FlipMove from 'react-flip-move'

export const HippoCheckboxGroup = class _HippoCheckboxGroup extends Component {

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
    this.props.checkboxGroupOnChange(event)
  }

  render() {
    const { id, name, error, label, values, colClasses } = this.props

    return (
      <div style={{ position: 'relative' }}>
        <FlipMove
          enterAnimation="accordionVertical"
          leaveAnimation="accordionVertical"
          maintainContainerHeight={true}
        >
          {!this.state.visible ?
            <div className="row" key={`key-${name}-hidden`}>
            </div>
          : (
            <div className="row" key={`key-${name}-visible`}>
              <div className={colClasses}>
                <div id={id} className={classNames('form-group', { 'has-error': error })}>
                  <ControlLabel>{label}</ControlLabel>
                  <FormGroup>
                    {
                      values.map((value) => {
                        return <Checkbox
                                key={`${name}-${value}`}
                                name={name}
                                inline
                                onClick={this.handleChange}
                                value={value}>
                                  {value}
                                </Checkbox>
                      })
                    }
                  </FormGroup>

                  {error}
                </div>
              </div>
            </div>
          )}
        </FlipMove>
      </div>
    )
  }
}
