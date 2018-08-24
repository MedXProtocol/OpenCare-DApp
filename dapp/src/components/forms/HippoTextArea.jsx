import React, { Component } from 'react'
import classnames from 'classnames'
import { defined } from '~/utils/defined'
import FlipMove from 'react-flip-move'
import TextareaAutosize from 'react-autosize-textarea'

export const HippoTextArea = class _HippoTextArea extends Component {

  static defaultProps = {
    rowClasses: 'row'
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

  handleBlur = (event) => {
    event.persist()
    this.props.textAreaOnBlur(event, this.props.name)
  }

  handleChange = (event) => {
    event.persist()
    this.props.textAreaOnChange(event, this.props.name)
  }

  render() {
    let { label } = this.props
    const { name, error, colClasses, rowClasses } = this.props

    if (this.props.optional) {
      label = <React.Fragment>
        {label} <span className="text-gray">(Optional)</span>
      </React.Fragment>
    }

    const controlLabel = <label className="control-label">
      {label}
    </label>

    if (this.props.value) {
      var valueProp = {
        value: this.props.value
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
            <span key={`key-${name}-hidden`}>
            </span>
          : (
              <div className={rowClasses}>
                <div className={colClasses ? colClasses : ''}>
                  <div className={classnames('form-group', { 'has-error': error })}>
                    {controlLabel}
                    <TextareaAutosize
                      rows={2}
                      id={name}
                      name={name}
                      onChange={this.handleChange}
                      onBlur={this.handleBlur}
                      className="form-control"
                      {...valueProp}
                    />
                    {error}
                  </div>
                </div>
              </div>
            )
          }
        </FlipMove>
      </React.Fragment>
    )
  }
}
