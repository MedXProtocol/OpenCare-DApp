import React, {
  PureComponent
} from 'react'
import { ChunkLoading } from '~/components/ChunkLoading'
import FlipMove from 'react-flip-move'

export const newAsyncWrap = function ({ createImport, name }) {
  return class _AsyncWrap extends PureComponent {
    constructor (props) {
      super(props)
      this.state = {}
      this.mounted = false
    }

    componentDidMount () {
      this.runMount()
    }

    componentDidUpdate () {
      this.runMount()
    }

    runMount() {
      if (this.mounted) { return }
      createImport().then(_module => {
        this.setState({
          Component: _module[name]
        })
      })
      this.mounted = true
    }

    render () {
      return (
        <div>
          <FlipMove
            enterAnimation="fade"
            leaveAnimation="fade"
            duration={100}
            maintainContainerHeight={true}
          >
            {this.state.Component ?
                <div key={`key-async-wrap-visible`}>
                  {React.createElement(this.state.Component, this.props)}
                </div>
              : <div key={`key-async-wrap-hidden`}>
                  <ChunkLoading />
                </div>
            }
          </FlipMove>
        </div>
      )
    }
  }
}
