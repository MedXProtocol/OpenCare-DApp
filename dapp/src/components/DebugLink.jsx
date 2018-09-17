import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'

export const DebugLink = ReactTimeout(class _DebugLink extends Component {

  initFirebug = () => {
    if (window.firebug.version){
      window.firebug.init()
    } else {
      this.props.setTimeout(this.initFirebug)
    }
  }

  setFirebugCallback = () => {
    if(window.firebug && window.firebug.version) {
      window.debug.setCallback(function(b){
        var a = Array.prototype.slice.call(arguments,1)
        window.firebug.d.console.cmd[b].apply(window,a)
      }, true)
    } else {
      this.props.setTimeout(this.setFirebugCallback, 100)
    }
  }

  handleRenderDebugger = () => {
    if (window && document && !window.firebug) {
      window.firebug = document.createElement("script")
      window.firebug.setAttribute("src", "/firebug-lite-compressed.js")
      document.body.appendChild(window.firebug)

      this.props.setTimeout(() => {
        this.initFirebug()
      }, 100)

      if(window.debug && window.debug.setCallback) {
        this.setFirebugCallback()
      }
    }
  }

  render() {
    return (
      <a onClick={this.handleRenderDebugger} className='btn btn-primary'>
        Open Firebug
      </a>
    )
  }

})
