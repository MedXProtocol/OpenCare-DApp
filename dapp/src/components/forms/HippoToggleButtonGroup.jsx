import React, { Component } from 'react'
import classnames from 'classnames'
import { defined } from '~/utils/defined'
import { ControlLabel, ToggleButtonGroup, ToggleButton, ButtonToolbar } from 'react-bootstrap'
import FlipMove from 'react-flip-move'

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

    let controlLabel = label ? <ControlLabel>{label}</ControlLabel> : null

    let formGroupClasses = classnames('form-group', { 'has-error': error }, this.props.formGroupClassNames)

    return (
      <React.Fragment>
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
                <div id={id} className={formGroupClasses}>
                  {controlLabel}
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
          )}
        </FlipMove>
      </React.Fragment>
    )
  }
}
