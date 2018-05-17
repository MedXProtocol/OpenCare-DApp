import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'

export class DrizzleComponent extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {}
  }

  componentDidMount () {
    this.checkDrizzleInit(this.props)
  }

  componentWillReceiveProps (props) {
    this.checkDrizzleInit(props)
  }

  checkDrizzleInit (props) {
    if (props.drizzleInitialized && this.context && this.context.drizzle) {
      this.drizzleInit(props)
    }
  }

  drizzleInit (props) {
    throw 'Not implemented'
  }
}

DrizzleComponent.contextTypes = {
  drizzle: PropTypes.object
}
