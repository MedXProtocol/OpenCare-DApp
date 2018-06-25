import React from 'react';
import classNames from 'classnames'

export const LoadingLines = props => (
  <div className={classNames('loader', { 'hidden': !props.visible })}>
    <div className="loader-inner line-scale">
      <div style={{'backgroundColor': props.color ? props.color : '#cccccc'}}></div>
      <div style={{'backgroundColor': props.color ? props.color : '#cccccc'}}></div>
      <div style={{'backgroundColor': props.color ? props.color : '#cccccc'}}></div>
      <div style={{'backgroundColor': props.color ? props.color : '#cccccc'}}></div>
      <div style={{'backgroundColor': props.color ? props.color : '#cccccc'}}></div>
    </div>
  </div>
)
