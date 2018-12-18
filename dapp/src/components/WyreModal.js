import React, { Component } from 'react'
import ReactTimeout from 'react-timeout'

export const WyreModal = ReactTimeout(class _WyreModal extends Component {

  componentDidMount() {
    this.handler = new window.Wyre({
      apiKey: "AK-P6B4DP8N-J2MDNWW9-YUX8LMMP-7QJZHPAT",
      env: "test",
      onExit: function (error) {
        if (error != null)
          console.error(error)
        else
          console.log("exited!")
      },
      onSuccess: function () {
        console.log("success!")
      }
    })
  }

  handleOpenWyre = (e) => {
    e.preventDefault()

    this.handler.open()
  }

  render () {
    return (
      <div>
        <button
          className="btn btn-primary"
          onClick={this.handleOpenWyre}
        >
          Purchase DAI or ETH with Wyre
        </button>
        <script src="/popper.min.js"></script>
        <script src="/bootstrap.min.js"></script>
      </div>
    )
  }
})
