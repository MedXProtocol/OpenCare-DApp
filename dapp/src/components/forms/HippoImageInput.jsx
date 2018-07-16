import React, { Component } from 'react'
import { ProgressBar } from 'react-bootstrap'
import classNames from 'classnames'

export const HippoImageInput = class _HippoImageInput extends Component {
  render() {
    const { name, id, label, error, fileError, setRef, onChange,
      currentValue, progressClassNames, progressPercent, colClasses } = this.props

    let required
    if (this.props.required)
      required = <span className='star'>*</span>

    return (
      <div className="row">
        <div id={id} className={colClasses}>
          <div className={classNames('form-group', { 'has-error': error || fileError })}>
            <label className='control-label'>{label} {required}</label>
            <div>
              <div className="hidden-input-mask">
                <input ref={setRef} />
              </div>
              <label className="btn btn btn-info">
                Select File ... <input
                            name={name}
                            onChange={onChange}
                            type="file"
                            accept='image/*'
                            className="form-control"
                            style={{ display: 'none' }} />
              </label>
              <span>
                &nbsp; {currentValue}
              </span>
              <div className={progressClassNames}>
                <ProgressBar
                  active
                  bsStyle="success"
                  now={progressPercent} />
              </div>
              {error}
              {fileError}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

