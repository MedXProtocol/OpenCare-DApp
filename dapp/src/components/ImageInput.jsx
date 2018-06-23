import React, { Component } from 'react'
import { ProgressBar } from 'react-bootstrap'
import classNames from 'classnames'

export const ImageInput = class extends Component {
  render() {
    const { name, id, label, error, fileError, setRef, onChange,
      currentValue, progressClassNames, progressPercent } = this.props

    let required
    if (this.props.required)
      required = <span className='star'>*</span>

    return (
      <div className="row">
        <div id={id} className="col-xs-12 col-sm-12 col-md-6">
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

// name='firstImage'
// id='firstImageHash'
// error={errors['firstImageHash']}
// fileError={firstFileError}
// setRef={this.setFirstImageHashRef}
// onChange={this.captureFirstImage}
// currentValue={this.state.firstFileName}
// progressClassNames={this.progressClassNames(this.state.firstImagePercent)}
// progressPercent={this.state.firstImagePercent}
