import React, { Component } from 'react'
import classNames from 'classnames'

export const HippoTextInput = class extends Component {
  render() {
    const { name, label, error, setRef, onChange, colClasses, type } = this.props

    let required
    if (this.props.required)
      required = <span className='star'>*</span>

    return (
      <div className={colClasses ? 'row' : ''}>
        <div className={colClasses ? colClasses : ''}>
          <div className={classNames('form-group', { 'has-error': error })}>
            <label>{label} {required}</label>
            <input
              name={name}
              onChange={onChange}
              type={type ? type : "text"}
              ref={setRef}
              className="form-control" />
            {error}
          </div>
        </div>
      </div>
    )
  }
}

