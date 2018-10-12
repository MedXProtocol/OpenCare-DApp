import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  withSaga,
  contractByName
} from 'saga-genesis'
import { Dai } from '~/components/Dai'
import { Ether } from '~/components/Ether'
import { EtherFlip } from '~/components/EtherFlip'
import { mapStateToCase } from '~/services/case/mapStateToCase'
import { caseSaga } from '~/services/case/caseSaga'
import { connect } from 'react-redux'

function mapStateToProps(state, { address }) {
  const caseObject = mapStateToCase(state, { caseAddress: address })
  const Dai = contractByName(state, 'Dai')
  const WrappedEther = contractByName(state, 'WrappedEther')

  return {
    Dai,
    WrappedEther,
    caseObject
  }
}

function* caseFeeSaga({ caseObject }) {
  yield caseSaga(caseObject)
}

export const CaseFee = connect(mapStateToProps)(
  withSaga(caseFeeSaga)(
    class _CaseFee extends PureComponent {
      static propTypes = {
        address: PropTypes.string.isRequired,
        calc: PropTypes.func,
        noToggle: PropTypes.bool,
        noFlip: PropTypes.bool
      }

      static defaultProps = {
        noToggle: false,
        noFlip: false
      }

      render () {
        if (this.props.calc) {
          var wei = this.props.calc(this.props.caseObject.caseFee)
        } else {
          wei = this.props.caseObject.caseFee
        }
        var result
        if (this.props.caseObject.tokenContract === this.props.Dai) {
          result = <Dai wei={wei} />
        } else if (this.props.caseObject.tokenContract === this.props.WrappedEther) {
          if (this.props.noFlip) {
            result = <Ether wei={wei} />
          } else {
            result = <EtherFlip wei={wei} noToggle={this.props.noToggle} />
          }
        } else {
          result = null
        }
        return result
      }
    }
  )
)
