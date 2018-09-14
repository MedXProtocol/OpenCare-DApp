import React, { Component } from 'react'
import classnames from 'classnames'
import { defined } from '~/utils/defined'
import PropTypes from 'prop-types'
import { ControlLabel, ToggleButtonGroup, ToggleButton, ButtonToolbar } from 'react-bootstrap'
import FlipMove from 'react-flip-move'

export const HippoToggleButtonGroup = class _HippoToggleButtonGroup extends Component {
  static propTypes = {
    visible: PropTypes.any,
    onChange: PropTypes.any,
    selectedValues: PropTypes.any,
    formGroupClassNames: PropTypes.any,
    id: PropTypes.any,
    name: PropTypes.any.isRequired,
    error: PropTypes.any,
    label: PropTypes.any,
    values: PropTypes.any,
    colClasses: PropTypes.any
  }

  constructor(props) {
    super(props)

    let visible = true
    if (typeof props.visible !== 'undefined') {
      visible = props.visible
    }

    this.state = {
      visible
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

    if (this.props.selectedValues) {
      var selectedValues = {
        value: this.props.selectedValues,
        onChange: this.props.onChange
      }
    }

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
                    <ToggleButtonGroup
                      name={name}
                      type="radio"
                      defaultValue={this.props.defaultValue}
                      {...selectedValues}
                    >
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
