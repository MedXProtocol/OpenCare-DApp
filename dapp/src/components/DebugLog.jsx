import React, {
  PureComponent
} from 'react'
import prettyFormat from 'pretty-format'
const debug = require('debug')

let logId = 0

export class DebugLog extends PureComponent {
  static defaultProps = {
    pageSize: 30
  }

  constructor (props) {
    super(props)
    this.state = {
      namespace: window.localStorage.debug || '*,-actions',
      logs: []
    }
  }

  componentDidMount () {
    this.attachNamespace(this.state.namespace)
    this.debugOriginalLog = debug.log
    debug.log = (...args) => {
      this.setState({
        logs: this.state.logs.concat({ id: logId++, log: args })
      })
    }
  }

  componentWillUnmount () {
    debug.log = this.debugOriginalLog
  }

  attachNamespace (namespace) {
    debug.enable(namespace)
  }

  detachNamespace () {
    debug.disable()
  }

  updateNamespace = () => {
    this.detachNamespace()
    this.attachNamespace(this.state.namespace)
  }

  handleUpdateNamespace = (e) => {
    e.preventDefault()
    this.updateNamespace()
  }

  handlePause = () => {
    this.setState({ namespace: 'PAUSED' }, this.updateNamespace)
  }

  handleAll = () => {
    this.setState({ namespace: '*' }, this.updateNamespace)
  }

  renderLog = (log) => {
    const args = log.log
    var pieces = args[0].split('%c')
    var namespace = pieces[1]
    var message = pieces[2]
    var timestamp = pieces[3]

    var namespaceColor = args[1].split(':')
    var messageColor = args[2].split(':')
    var timestampColor = args[3].split(':')

    var remainingArgs = log.log.slice(4)

    if (remainingArgs.length) {
      var preArgs = <pre style={{ fontSize: '10px' }}>
        {prettyFormat(remainingArgs, {
          maxDepth: 2
        })}
      </pre>
    }

    return (
      <div className='log-row' key={log.id}>
        <div className='row'>
          <div className='col-xs-12'>
            <span style={ { color: namespaceColor[1] } }>
              {namespace}
            </span>
            <span style={ { color: messageColor[1] } }>
              {message}
            </span>
            <span style={ { color: timestampColor[1] } }>
              {timestamp}
            </span>
            {preArgs}
          </div>
        </div>
      </div>
    )
  }

  render () {
    const logs = this.state.logs.slice(-this.props.pageSize)
    logs.reverse()
    return (
      <div className='panel panel-default'>
        <div className='panel-body'>
          <form className="row" onSubmit={this.handleUpdateNamespace}>
            <div className='form-group col-sm-6 text-left'>
              <label>Debug Namespace</label>
              <input
                value={this.state.namespace}
                onChange={(event) => this.setState({ namespace: event.target.value })}
                className="form-control input-sm"
                placeholder="block-sagas,-actions" />
            </div>
            <div className='form-group col-sm-6 text-left'>
              <label>Controls</label>
              <div>
                <input type='submit' className='btn btn-sm btn-primary' value='Update' />
                  &nbsp;
                <button onClick={this.handlePause} className='btn btn-sm btn-primary'>Pause</button>
                  &nbsp;
                <button onClick={this.handleAll} className='btn btn-sm btn-primary'>All</button>
              </div>
            </div>
          </form>
          <div className='text-left'>
            {logs.map((args) => this.renderLog(args))}
          </div>
        </div>
      </div>
    )
  }
}
