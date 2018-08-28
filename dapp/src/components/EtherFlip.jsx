import React, {
  Component
} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  cacheCall,
  cacheCallValue,
  withSaga,
  contractByName
} from '~/saga-genesis'
import { weiToUsd } from '~/utils/weiToUsd'
import { displayWeiToUsd } from '~/utils/displayWeiToUsd'
import { Ether } from './Ether'

function mapStateToProps(state) {
  const CaseManager = contractByName(state, 'CaseManager')
  return {
    usdPerWei: cacheCallValue(state, CaseManager, 'usdPerWei'),
    CaseManager
  }
}

function* etherFlipSaga({ CaseManager }) {
  if (!CaseManager) { return }
  yield cacheCall(CaseManager, 'usdPerWei')
}

export const EtherFlip = connect(mapStateToProps)(
  withSaga(etherFlipSaga)(
    class _EtherFlip extends Component {
      static propTypes = {
        wei: PropTypes.any.isRequired
      }

      static defaultProps = {
        wei: '0',
        usdPerWei: '1'
      }

      constructor (props) {
        super(props)
        this.state = {
          showUsd: false
        }
      }

      onFlip = () => {
        this.setState({showUsd: !this.state.showUsd})
      }

      render () {
        const wei = this.props.wei || 0

        if (this.state.showUsd) {
          var value = (
            <span>${displayWeiToUsd(weiToUsd(wei, this.props.usdPerWei))} USD</span>
          )
        } else {
          value = <Ether wei={wei} />
        }

        return <span className='ether-flip flip-link' onClick={this.onFlip}>{value}</span>
      }
    }
  )
)
